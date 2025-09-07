-- =============================================================================
-- AUTO CREATE ONBOARDING SESSIONS FOR NEW USERS
-- =============================================================================
-- This migration creates a trigger that automatically creates onboarding sessions
-- for new users when they sign up via auth.users table
-- =============================================================================

BEGIN;

-- =============================================================================
-- FUNCTION: Create onboarding session for new user
-- =============================================================================
-- This function creates an onboarding session with default values when a new
-- user is created in the auth.users table
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_onboarding_session_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_default_flow_id UUID;
  v_recovery_token UUID;
  v_existing_session_count INTEGER;
BEGIN
  -- Log the start of the function execution
  RAISE LOG 'Creating onboarding session for user: %', NEW.id;
  
  -- Check if a session already exists for this user to prevent duplicates
  SELECT COUNT(*)
  INTO v_existing_session_count
  FROM public.onboarding_sessions
  WHERE user_id = NEW.id;
  
  -- Only create session if none exists
  IF v_existing_session_count = 0 THEN
    BEGIN
      -- Get the default onboarding flow ID (fallback to 'Standard Onboarding' or first active flow)
      SELECT id
      INTO v_default_flow_id
      FROM public.onboarding_flows
      WHERE (name = 'Standard Onboarding' OR is_active = true)
        AND is_active = true
      ORDER BY 
        CASE WHEN name = 'Standard Onboarding' THEN 0 ELSE 1 END,
        created_at ASC
      LIMIT 1;
      
      -- If no flow exists, create a default one
      IF v_default_flow_id IS NULL THEN
        INSERT INTO public.onboarding_flows (
          name,
          description,
          steps,
          is_active
        ) VALUES (
          'Default Onboarding',
          'Automatically created default onboarding flow',
          '[
            {"id": 1, "name": "welcome", "title": "Welcome", "required": true},
            {"id": 2, "name": "business_info", "title": "Business Information", "required": true},
            {"id": 3, "name": "whatsapp_setup", "title": "WhatsApp Setup", "required": true},
            {"id": 4, "name": "testing", "title": "Test Your Bot", "required": false}
          ]'::jsonb,
          true
        )
        RETURNING id INTO v_default_flow_id;
        
        RAISE LOG 'Created default onboarding flow with ID: %', v_default_flow_id;
      END IF;
      
      -- Generate a unique recovery token
      v_recovery_token := gen_random_uuid();
      
      -- Create the onboarding session
      INSERT INTO public.onboarding_sessions (
        user_id,
        user_email,
        flow_id,
        current_step,
        status,
        completed_steps,
        step_data,
        analytics,
        expires_at,
        recovery_token,
        metadata,
        started_at,
        last_activity_at
      ) VALUES (
        NEW.id,
        NEW.email,
        v_default_flow_id,
        0,  -- Start at step 0 (welcome)
        'in_progress',
        ARRAY[]::TEXT[],  -- Empty array of completed steps
        '{}'::jsonb,  -- Empty JSON object for step data
        jsonb_build_object(
          'created_at', NOW(),
          'created_by_trigger', true,
          'source', 'auto_creation_on_signup'
        ),
        NOW() + INTERVAL '7 days',  -- Session expires in 7 days
        v_recovery_token::TEXT,
        jsonb_build_object(
          'user_agent', COALESCE(current_setting('request.headers', true)::json->>'user-agent', 'unknown'),
          'created_from_trigger', true
        ),
        NOW(),
        NOW()
      );
      
      RAISE LOG 'Successfully created onboarding session for user: % with recovery token: %', NEW.id, v_recovery_token;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create onboarding session for user %: %', NEW.id, SQLERRM;
        -- Continue without failing the trigger
    END;
  ELSE
    RAISE LOG 'Onboarding session already exists for user: %, skipping creation', NEW.id;
  END IF;
  
  -- Always return NEW to allow the user creation to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to the function for documentation
COMMENT ON FUNCTION public.create_onboarding_session_for_new_user() IS 
'Automatically creates an onboarding session for new users when they sign up. 
The session includes a recovery token, expires after 7 days, and starts at the welcome step.
If a session already exists for the user, no new session is created.';

-- =============================================================================
-- TRIGGER: Create onboarding session after user creation
-- =============================================================================
-- This trigger fires AFTER a new user is inserted into auth.users table
-- It runs after the handle_new_user trigger to ensure the profile exists
-- =============================================================================

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_onboarding ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_onboarding_session_for_new_user();

-- Note: Comments on auth.users triggers require superuser privileges
-- The trigger works without the comment

-- =============================================================================
-- INDEXES: Performance optimization for onboarding session lookups
-- =============================================================================

-- Index for faster user_id lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id_status 
  ON public.onboarding_sessions(user_id, status)
  WHERE status IN ('in_progress', 'paused');

-- Index for expired session cleanup (if not exists)
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_expires_at 
  ON public.onboarding_sessions(expires_at)
  WHERE status = 'in_progress' AND expires_at IS NOT NULL;

-- Index for recovery token lookups with status (if not exists)
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_recovery_status 
  ON public.onboarding_sessions(recovery_token, status)
  WHERE recovery_token IS NOT NULL;

-- =============================================================================
-- FUNCTION: Cleanup expired onboarding sessions (optional utility)
-- =============================================================================
-- This function can be called periodically to clean up expired sessions
-- =============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_onboarding_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Update expired sessions to 'expired' status
  WITH updated AS (
    UPDATE public.onboarding_sessions
    SET 
      status = 'expired',
      updated_at = NOW()
    WHERE 
      status = 'in_progress'
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_count FROM updated;
  
  RAISE LOG 'Marked % expired onboarding sessions', v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to the cleanup function
COMMENT ON FUNCTION public.cleanup_expired_onboarding_sessions() IS 
'Utility function to mark expired onboarding sessions. Can be called periodically via pg_cron or similar.';

-- =============================================================================
-- VERIFICATION: Ensure the migration is idempotent
-- =============================================================================

DO $$
BEGIN
  -- Verify the trigger exists
  IF EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created_onboarding'
  ) THEN
    RAISE NOTICE 'Trigger on_auth_user_created_onboarding successfully created';
  ELSE
    RAISE WARNING 'Trigger on_auth_user_created_onboarding was not created';
  END IF;
  
  -- Verify the function exists
  IF EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'create_onboarding_session_for_new_user'
  ) THEN
    RAISE NOTICE 'Function create_onboarding_session_for_new_user successfully created';
  ELSE
    RAISE WARNING 'Function create_onboarding_session_for_new_user was not created';
  END IF;
  
  -- Log migration completion
  RAISE NOTICE 'Migration completed: Auto-create onboarding sessions for new users';
END $$;

COMMIT;

-- =============================================================================
-- ROLLBACK SCRIPT (commented out, use if needed to revert)
-- =============================================================================
-- BEGIN;
-- DROP TRIGGER IF EXISTS on_auth_user_created_onboarding ON auth.users;
-- DROP FUNCTION IF EXISTS public.create_onboarding_session_for_new_user();
-- DROP FUNCTION IF EXISTS public.cleanup_expired_onboarding_sessions();
-- DROP INDEX IF EXISTS idx_onboarding_sessions_user_id_status;
-- DROP INDEX IF EXISTS idx_onboarding_sessions_expires_at;
-- DROP INDEX IF EXISTS idx_onboarding_sessions_recovery_status;
-- COMMIT;
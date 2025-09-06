'use client';

/**
 * Business Info Form Component
 * Presentation Layer - Pure UI component for business information form
 *
 * This component contains ONLY presentation logic:
 * - JSX rendering
 * - Form field rendering
 * - UI event handling (delegated to hook)
 *
 * ALL business logic is extracted to useBusinessInfoForm hook
 */

import { ArrowRight, Building2, Loader2 } from 'lucide-react';

import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Combobox, type ComboboxOption } from '@/modules/shared/presentation/components/ui/combobox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/modules/shared/presentation/components/ui/form';
import { Input } from '@/modules/shared/presentation/components/ui/input';
import { Textarea } from '@/modules/shared/presentation/components/ui/textarea';

import { useBusinessInfoForm, type UseBusinessInfoFormOptions } from '../../presentation/hooks/use-business-info-form';

// Re-export BusinessInfoFormProps from domain/types.ts for backward compatibility
export type { BusinessInfoFormProps } from '../../domain/types';

// Type assertion for Combobox compatibility
interface BusinessInfoFormProps {
  className?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  defaultValues?: Partial<any>;
}

// =============================================================================
// PRESENTATIONAL COMPONENT - Only JSX rendering
// =============================================================================

export function BusinessInfoForm({
  className,
  onSuccess,
  onError,
  defaultValues
}: BusinessInfoFormProps) {

  // =============================================================================
  // HOOK INTEGRATION - All business logic from hook
  // =============================================================================

  const {
    form,
    isSubmitting,
    onSubmit,
    businessTypes,
    industries,
    employeeRanges,
    volumeOptions
  } = useBusinessInfoForm({
    onSuccess,
    onError,
    defaultValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className || ''}`}>
        {/* Company Name */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Nombre de la Empresa *</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa el nombre de tu empresa"
                  {...field}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>
              <FormDescription>
                Usa el nombre oficial de tu negocio tal como aparece en los documentos de registro.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Type and Industry Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Negocio *</FormLabel>
                <FormControl>
                  <Combobox
                    options={businessTypes as ComboboxOption[]}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Buscar tipo de negocio..."
                    searchPlaceholder="Escribir para buscar..."
                    emptyText="No se encontraron resultados"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industria *</FormLabel>
                <FormControl>
                  <Combobox
                    options={industries as ComboboxOption[]}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Buscar industria..."
                    searchPlaceholder="Escribir para buscar..."
                    emptyText="No se encontraron resultados"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Employee Count and Website Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employeeRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Empleados *</FormLabel>
                <FormControl>
                  <Combobox
                    options={employeeRanges}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleccionar rango..."
                    searchPlaceholder="Buscar rango..."
                    emptyText="No se encontraron resultados"
                  />
                </FormControl>
                <FormDescription>
                  Esto nos ayuda a recomendar el plan adecuado para tus necesidades.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del Sitio Web</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://tuempresa.com"
                    {...field}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormDescription>
                  Opcional. Se usa para verificación si está disponible.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Expected Volume */}
        <FormField
          control={form.control}
          name="expectedVolume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volumen de Mensajes Esperado *</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {volumeOptions.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormDescription>
                Esto nos ayuda a sugerir el plan y configuración más adecuados.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Negocio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cuéntanos sobre tu negocio y cómo planeas usar WhatsApp..."
                  className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Opcional. Ayúdanos a entender tu caso de uso para brindar mejores recomendaciones.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando Información...
              </>
            ) : (
              <>
                Continuar a Integración de WhatsApp
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

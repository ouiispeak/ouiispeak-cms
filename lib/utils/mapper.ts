/**
 * Generic Mapper Utility
 * 
 * Provides a type-safe, DRY way to convert between database rows and domain models.
 * Eliminates repetitive mapper code across groupMapper, lessonMapper, moduleMapper, and slideMapper.
 * 
 * Usage:
 *   const mapper = createMapper<DomainType, DataType>({
 *     fieldMappings: {
 *       domainField: 'db_field',
 *       // or
 *       domainField: { dbField: 'db_field', transform: (val) => val ?? '' }
 *     },
 *     defaults: { optionalField: '' }
 *   });
 * 
 *   const domain = mapper.toDomain(dbRow);
 *   const update = mapper.toRowUpdate(partialDomain);
 * 
 * Last updated: [Current Date]
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Field mapping configuration
 * Can be a simple string (direct mapping) or an object with transform function
 */
export type FieldMapping =
  | string // Direct field name mapping (db_field -> domainField)
  | {
      dbField: string; // Database field name
      transform?: (value: unknown) => unknown; // Optional transform function
    };

/**
 * Mapping configuration for creating a mapper
 */
export interface MapperConfig<Domain, Data> {
  /**
   * Field mappings from domain property names to database field names
   * Key: domain property name (camelCase)
   * Value: database field name (snake_case) or mapping config
   */
  fieldMappings: Record<keyof Domain, FieldMapping>;

  /**
   * Default values for optional fields when converting from DB to domain
   */
  defaults?: Partial<Domain>;

  /**
   * Custom transform function for the entire domain object (optional)
   * Useful for complex transformations that can't be expressed in field mappings
   */
  customDomainTransform?: (data: Data) => Domain;

  /**
   * Custom transform function for the entire update object (optional)
   * Useful for complex transformations when converting domain to DB update
   */
  customUpdateTransform?: (input: Partial<Domain>) => Partial<Data>;
}

// ============================================================================
// Generic Mapper Class
// ============================================================================

/**
 * Generic mapper for converting between database rows and domain models
 */
export class Mapper<Domain, Data> {
  private fieldMappings: Record<string, FieldMapping>;
  private defaults: Partial<Domain>;
  private customDomainTransform?: (data: Data) => Domain;
  private customUpdateTransform?: (input: Partial<Domain>) => Partial<Data>;

  constructor(config: MapperConfig<Domain, Data>) {
    this.fieldMappings = config.fieldMappings as Record<string, FieldMapping>;
    this.defaults = config.defaults || {};
    this.customDomainTransform = config.customDomainTransform;
    this.customUpdateTransform = config.customUpdateTransform;
  }

  /**
   * Convert database row to domain model
   */
  toDomain(data: Data): Domain {
    // Use custom transform if provided
    if (this.customDomainTransform) {
      return this.customDomainTransform(data);
    }

    const domain = {} as Domain;
    const dataRecord = data as Record<string, unknown>;

    // Map each field according to configuration
    for (const [domainKey, mapping] of Object.entries(this.fieldMappings)) {
      const dbField = typeof mapping === "string" ? mapping : mapping.dbField;
      const transform = typeof mapping === "object" ? mapping.transform : undefined;

      const dbValue = dataRecord[dbField];

      if (transform) {
        (domain as Record<string, unknown>)[domainKey] = transform(dbValue as never);
      } else {
        (domain as Record<string, unknown>)[domainKey] = dbValue;
      }
    }

    // Apply defaults for any missing fields
    for (const [key, defaultValue] of Object.entries(this.defaults)) {
      if ((domain as Record<string, unknown>)[key] === undefined) {
        (domain as Record<string, unknown>)[key] = defaultValue;
      }
    }

    return domain;
  }

  /**
   * Convert domain model to database row update shape
   * Only includes fields that are defined (not undefined)
   */
  toRowUpdate(input: Partial<Domain>): Partial<Data> {
    // Use custom transform if provided
    if (this.customUpdateTransform) {
      return this.customUpdateTransform(input);
    }

    const update: Partial<Data> = {};
    const inputRecord = input as Record<string, unknown>;

    // Map each field according to configuration
    for (const [domainKey, mapping] of Object.entries(this.fieldMappings)) {
      const inputValue = inputRecord[domainKey];

      // Only include defined fields
      if (inputValue !== undefined) {
        const dbField = typeof mapping === "string" ? mapping : mapping.dbField;
        (update as Record<string, unknown>)[dbField] = inputValue;
      }
    }

    return update;
  }

  /**
   * Convert array of database rows to array of domain models
   */
  toDomainArray(dataArray: Data[]): Domain[] {
    return dataArray.map((data) => this.toDomain(data));
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mapper instance with the given configuration
 */
export function createMapper<Domain, Data>(
  config: MapperConfig<Domain, Data>
): Mapper<Domain, Data> {
  return new Mapper(config);
}

/**
 * Helper to create a field mapping with a default value transform
 */
export function withDefault<T>(dbField: string, defaultValue: T): FieldMapping {
  return {
    dbField,
    transform: (value: unknown) => (value !== null && value !== undefined ? value : defaultValue) as T,
  };
}

/**
 * Helper to create a field mapping with a custom transform
 */
export function withTransform<TInput, TOutput>(
  dbField: string,
  transform: (value: TInput) => TOutput
): FieldMapping {
  return {
    dbField,
    transform: (value: unknown) => transform(value as TInput) as unknown,
  };
}


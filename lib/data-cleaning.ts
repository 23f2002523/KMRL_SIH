// Data cleaning and processing utilities for uploaded files
export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  dataType: 'string' | 'date' | 'number' | 'enum';
  required: boolean;
  enumValues?: string[];
}

export interface CleanedRecord {
  original: Record<string, any>;
  cleaned: Record<string, any>;
  errors: string[];
  isValid: boolean;
}

// Column mappings for different data types
export const COLUMN_MAPPINGS = {
  maintenance: [
    { sourceColumn: '_0', targetField: 'trainId', dataType: 'string', required: true },
    { sourceColumn: '_1', targetField: 'lastMaintenanceDate', dataType: 'date', required: true },
    { sourceColumn: '_2', targetField: 'nextDueDate', dataType: 'date', required: true },
    { sourceColumn: '_3', targetField: 'maintenanceType', dataType: 'string', required: true },
    { sourceColumn: '_4', targetField: 'status', dataType: 'enum', required: true, 
      enumValues: ['Pending', 'Completed', 'Overdue', 'In Progress', 'Cancelled'] },
    { sourceColumn: '_5', targetField: 'remarks', dataType: 'string', required: false }
  ] as ColumnMapping[],
  
  trainset: [
    { sourceColumn: '_0', targetField: 'serialNo', dataType: 'string', required: true },
    { sourceColumn: '_1', targetField: 'status', dataType: 'enum', required: true,
      enumValues: ['Active', 'Standby', 'Maintenance'] },
    { sourceColumn: '_2', targetField: 'mileageKm', dataType: 'number', required: false },
    { sourceColumn: '_3', targetField: 'lastServiceDate', dataType: 'date', required: false }
  ] as ColumnMapping[]
};

/**
 * Clean and validate a single data value
 */
export function cleanValue(value: any, dataType: 'string' | 'date' | 'number' | 'enum', enumValues?: string[]): {
  cleaned: any;
  error?: string;
} {
  // Handle null, undefined, empty string
  if (value === null || value === undefined || value === '') {
    return { cleaned: null };
  }

  // Convert to string first for processing
  const stringValue = String(value).trim();
  
  if (stringValue === '') {
    return { cleaned: null };
  }

  switch (dataType) {
    case 'string':
      return { cleaned: stringValue };

    case 'number':
      const numValue = parseFloat(stringValue.replace(/[^\d.-]/g, ''));
      if (isNaN(numValue)) {
        return { cleaned: null, error: `Invalid number: ${stringValue}` };
      }
      return { cleaned: numValue };

    case 'date':
      // Try different date formats
      const dateFormats = [
        /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/   // MM-DD-YYYY
      ];

      let parsedDate: Date | null = null;
      
      if (dateFormats[0].test(stringValue)) {
        // YYYY-MM-DD format
        parsedDate = new Date(stringValue);
      } else if (dateFormats[1].test(stringValue)) {
        // MM/DD/YYYY format
        const [month, day, year] = stringValue.split('/');
        parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else if (dateFormats[2].test(stringValue)) {
        // MM-DD-YYYY format
        const [month, day, year] = stringValue.split('-');
        parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        // Try native Date parsing as fallback
        parsedDate = new Date(stringValue);
      }

      if (!parsedDate || isNaN(parsedDate.getTime())) {
        return { cleaned: null, error: `Invalid date format: ${stringValue}` };
      }

      // Return as ISO string for consistency
      return { cleaned: parsedDate.toISOString().split('T')[0] };

    case 'enum':
      if (!enumValues) {
        return { cleaned: stringValue };
      }

      // Normalize the value (case-insensitive matching)
      const normalizedValue = stringValue.toLowerCase();
      const matchedValue = enumValues.find(enumVal => 
        enumVal.toLowerCase() === normalizedValue
      );

      if (matchedValue) {
        return { cleaned: matchedValue };
      }

      // Try partial matching
      const partialMatch = enumValues.find(enumVal =>
        enumVal.toLowerCase().includes(normalizedValue) ||
        normalizedValue.includes(enumVal.toLowerCase())
      );

      if (partialMatch) {
        return { cleaned: partialMatch };
      }

      return { 
        cleaned: stringValue, 
        error: `Invalid enum value: ${stringValue}. Expected one of: ${enumValues.join(', ')}` 
      };

    default:
      return { cleaned: stringValue };
  }
}

/**
 * Determine data type based on column structure
 */
export function determineDataType(sampleData: Record<string, any>[]): 'maintenance' | 'trainset' | 'generic' {
  if (sampleData.length === 0) return 'generic';

  // Check first row (usually headers)
  const firstRow = sampleData[0];
  const values = Object.values(firstRow).map(v => String(v).toLowerCase());
  
  // Check for maintenance data indicators
  const maintenanceIndicators = ['train', 'maintenance', 'due', 'status', 'check', 'repair'];
  const trainsetIndicators = ['serial', 'trainset', 'mileage', 'service'];

  const maintenanceCount = maintenanceIndicators.reduce((count, indicator) => 
    count + values.filter(val => val.includes(indicator)).length, 0
  );

  const trainsetCount = trainsetIndicators.reduce((count, indicator) => 
    count + values.filter(val => val.includes(indicator)).length, 0
  );

  if (maintenanceCount > trainsetCount) {
    return 'maintenance';
  } else if (trainsetCount > 0) {
    return 'trainset';
  }

  return 'generic';
}

/**
 * Clean a single record using column mappings
 */
export function cleanRecord(
  rawData: Record<string, any>, 
  columnMappings: ColumnMapping[]
): CleanedRecord {
  const cleaned: Record<string, any> = {};
  const errors: string[] = [];

  for (const mapping of columnMappings) {
    const rawValue = rawData[mapping.sourceColumn];
    
    // Check required fields
    if (mapping.required && (rawValue === null || rawValue === undefined || String(rawValue).trim() === '')) {
      errors.push(`Required field '${mapping.targetField}' is missing`);
      continue;
    }

    // Clean the value
    const { cleaned: cleanedValue, error } = cleanValue(
      rawValue, 
      mapping.dataType, 
      mapping.enumValues
    );

    if (error) {
      errors.push(`${mapping.targetField}: ${error}`);
    }

    cleaned[mapping.targetField] = cleanedValue;
  }

  return {
    original: rawData,
    cleaned,
    errors,
    isValid: errors.length === 0
  };
}

/**
 * Process multiple records
 */
export function processRecords(
  rawRecords: Record<string, any>[],
  dataType: 'maintenance' | 'trainset' | 'generic'
): CleanedRecord[] {
  const columnMappings = dataType === 'generic' ? [] : COLUMN_MAPPINGS[dataType];
  
  // Skip header row (first row usually contains column names)
  const dataRows = rawRecords.slice(1);
  
  return dataRows.map(record => cleanRecord(record, columnMappings));
}

/**
 * Generate processing summary
 */
export function generateProcessingSummary(cleanedRecords: CleanedRecord[]) {
  const totalRecords = cleanedRecords.length;
  const validRecords = cleanedRecords.filter(r => r.isValid).length;
  const invalidRecords = totalRecords - validRecords;
  
  const errorTypes: Record<string, number> = {};
  cleanedRecords.forEach(record => {
    record.errors.forEach(error => {
      const errorType = error.split(':')[0];
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
  });

  return {
    totalRecords,
    validRecords,
    invalidRecords,
    validPercentage: totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 0,
    errorTypes
  };
}
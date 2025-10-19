import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export interface BOMRow {
  productCode: string;
  productName: string;
  category: string;
  metal: string;
  metalColor: string;
  karat: string;
  price: number;
  stock: number;
  weight: number;
  dimensions: string;
  description: string;
  [key: string]: any; // For additional columns
}

export class ExcelReader {
  /**
   * Read Excel file and convert to JSON
   */
  static readExcelFile(filePath: string): BOMRow[] {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '' // Default value for empty cells
      });
      
      // Get headers (first row)
      const headers = data[0] as string[];
      
      // Convert rows to objects
      const rows: BOMRow[] = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        if (row.length === 0 || !row[0]) continue; // Skip empty rows
        
        const rowObj: any = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            // Clean header name
            const cleanHeader = header.toString().trim().toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '');
            
            rowObj[cleanHeader] = row[index];
          }
        });
        
        // Map to our BOMRow interface
        const bomRow: BOMRow = {
          productCode: rowObj.product_code || rowObj.code || rowObj.sku || '',
          productName: rowObj.product_name || rowObj.name || rowObj.title || '',
          category: rowObj.category || rowObj.type || 'rings',
          metal: rowObj.metal || rowObj.material || '',
          metalColor: rowObj.metal_color || rowObj.color || '',
          karat: rowObj.karat || rowObj.purity || '',
          price: parseFloat(rowObj.price || rowObj.cost || '0'),
          stock: parseInt(rowObj.stock || rowObj.quantity || '0'),
          weight: parseFloat(rowObj.weight || '0'),
          dimensions: rowObj.dimensions || rowObj.size || '',
          description: rowObj.description || rowObj.details || ''
        };
        
        rows.push(bomRow);
      }
      
      return rows;
    } catch (error) {
      console.error('Error reading Excel file:', error);
      throw error;
    }
  }

  /**
   * Read multiple Excel files
   */
  static readMultipleExcelFiles(filePaths: string[]): { [fileName: string]: BOMRow[] } {
    const results: { [fileName: string]: BOMRow[] } = {};
    
    for (const filePath of filePaths) {
      try {
        const fileName = path.basename(filePath, '.xlsx');
        results[fileName] = this.readExcelFile(filePath);
        console.log(`✅ Successfully read ${fileName}: ${results[fileName].length} rows`);
      } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error);
        results[path.basename(filePath, '.xlsx')] = [];
      }
    }
    
    return results;
  }

  /**
   * Get unique product codes from BOM data
   */
  static getUniqueProductCodes(bomData: BOMRow[]): string[] {
    const codes = new Set<string>();
    bomData.forEach(row => {
      if (row.productCode) {
        codes.add(row.productCode);
      }
    });
    return Array.from(codes);
  }

  /**
   * Group BOM data by product code
   */
  static groupByProductCode(bomData: BOMRow[]): { [productCode: string]: BOMRow[] } {
    const grouped: { [productCode: string]: BOMRow[] } = {};
    
    bomData.forEach(row => {
      if (row.productCode) {
        if (!grouped[row.productCode]) {
          grouped[row.productCode] = [];
        }
        grouped[row.productCode].push(row);
      }
    });
    
    return grouped;
  }

  /**
   * Validate BOM data
   */
  static validateBOMData(bomData: BOMRow[]): { valid: BOMRow[], invalid: BOMRow[] } {
    const valid: BOMRow[] = [];
    const invalid: BOMRow[] = [];
    
    bomData.forEach(row => {
      if (row.productCode && row.productName && row.metal) {
        valid.push(row);
      } else {
        invalid.push(row);
      }
    });
    
    return { valid, invalid };
  }
}


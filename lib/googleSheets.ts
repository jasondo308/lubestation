import { google } from 'googleapis';
import path from 'path';

// Google Sheets configuration
const SHEET_ID = '1psFjAiBOdnia5eyNKp0-VMNdJO6NyFFl_5KDOEJWyZU';
const SHEET_NAME = 'Sheet1'; // The tab name in your spreadsheet (default is "Sheet1")

export interface OrderData {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  items: Array<{
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

/**
 * Initialize Google Sheets API client
 */
async function getSheetsClient() {
  const credentialsPath = path.join(process.cwd(), 'lunar-spring-434604-b3-e05a554cbc11.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client as any });

  return sheets;
}

/**
 * Initialize the spreadsheet with headers if it's empty
 */
export async function initializeSheet() {
  const sheets = await getSheetsClient();

  try {
    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:M1`,
    });

    // If no headers, add them
    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        'Timestamp',
        'Order ID',
        'Full Name',
        'Email',
        'Phone',
        'City',
        'Address',
        'Notes',
        'Items',
        'Subtotal',
        'Discount',
        'Shipping',
        'Total'
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });

      console.log('Headers initialized in Google Sheet');
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    throw error;
  }
}

/**
 * Add a new order to Google Sheets
 */
export async function addOrderToSheet(orderData: OrderData) {
  const sheets = await getSheetsClient();

  try {
    // Create a unique order ID
    const orderId = `ORD-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Format items as a readable string
    const itemsText = orderData.items
      .map(item => `${item.productName} (${item.size}) x${item.quantity} = ${item.price.toLocaleString('vi-VN')}₫`)
      .join('\n');

    // Prepare row data
    const row = [
      timestamp,
      orderId,
      orderData.full_name,
      orderData.email,
      orderData.phone,
      orderData.city,
      orderData.address,
      orderData.notes || '',
      itemsText,
      orderData.subtotal,
      orderData.discount,
      orderData.shipping,
      orderData.total,
    ];

    // Append the row
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:M`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    console.log('Order added to Google Sheets:', orderId);
    return {
      success: true,
      orderId,
      range: response.data.updates?.updatedRange,
    };
  } catch (error) {
    console.error('Error adding order to sheet:', error);
    throw error;
  }
}

/**
 * Get all orders from Google Sheets (optional - for future use)
 */
export async function getAllOrders() {
  const sheets = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:M`, // Skip header row
    });

    const rows = response.data.values || [];

    return rows.map(row => ({
      timestamp: row[0],
      orderId: row[1],
      fullName: row[2],
      email: row[3],
      phone: row[4],
      city: row[5],
      address: row[6],
      notes: row[7],
      items: row[8],
      subtotal: parseFloat(row[9]) || 0,
      discount: parseFloat(row[10]) || 0,
      shipping: parseFloat(row[11]) || 0,
      total: parseFloat(row[12]) || 0,
    }));
  } catch (error) {
    console.error('Error getting orders from sheet:', error);
    throw error;
  }
}

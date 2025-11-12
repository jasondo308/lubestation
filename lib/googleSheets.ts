import { google } from 'googleapis';

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
 * Uses environment variables if available (production), falls back to embedded credentials
 */
async function getSheetsClient() {
  let credentials;

  // Check if environment variables are set (Vercel production)
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    credentials = {
      type: 'service_account',
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    };
  } else {
    // Fallback to embedded credentials (works but less secure)
    credentials = {
      type: 'service_account',
      project_id: 'lunar-spring-434604-b3',
      private_key_id: 'e05a554cbc1129ca6a0aacda59119783fad5b409',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDjGo0fAt7oeY4U\noVl1vm9Rq8npC/PX48ySsBnttr3BUfCwyRevLrGrrNsQnBU/IaKlLAUqLA3keFU6\nHrafxgOJeGt/7Meqop5Qux3h6h4z6uSjp84QRLziz3QZSsTgRvP8WqmUinm7q7Cc\neOov2pcY5tPSaetygONyFv6JiF1OJ2iHv8HwhOQ1BSAglldyHM7l4DdgWM7uSfDp\n6C1jdEfhlD7+ZoL2d5FaaabaQ5bJHeUSIcG7SuMl/Ws5qsOVBg7ffNsB81+i0m4k\nVc6MNTGvxLeQCUV6CW9KS63WV1c3bpxV4h2I9NHzssCXTO3MjqZjLlzjEaEXgEgK\nnteUoZmnAgMBAAECggEAJC+mXdMcxokb0QC2mvLJlQdc6EPNylATWCo0L3LnQGb4\nhYq9Od4kVDj6PObJ4eHPoybk+cfEPOvJlLWxHrsz9BMaees2E2PO+wkdpVIjFt2u\nKb+Cr4fsWu14T9FglmXn2YVusOrxo6wjO4NuuUpIuiCJjuTurbOIyjSMwUhXqayD\n6KO57xWNUcIuHXSohS4qpL4o4IvAqsubbDREGK+XtAOJfti+G6oLPp+Zyk6a4cda\nZ5LF3TIoElUqkmd3z33ecyt0IJ6mKwdbKy6dB8CCykTRv62iTNcDINNODAiPd0fk\nXM24Jf8Nm9+HerBJJIJCw8ivpPQZoxURo9dwky+ioQKBgQD8lfWYGntkTLR2ijMQ\ny7zWquWhu0abxL9UtWGnQ+xQR5JcqT3x8F3VVm6V7yVAkbpMjHYp3WQZoHl+H5D1\nCrwtJRkkHQmCv/YjRoH5e1b9+3kZPc4DfULJ1sKzI3XZdBSR1XpAnOrH8p0I5kF3\neMMnyPg+PTyFHKmbZatSxPSUBwKBgQDmLGocblBKJnkwbhP+kSC8rES3MFa6FJxq\nRbfgvqq7gyD4GuFHA8SSI7UKYAi41OS5obk8yyi9IR6n/etrNKDKIZnTD3PwClqa\nKPWrmgqyLwDobkR527KCAZ1UfVloSqq3j9YF8WQOazUvuZTylnEcz2X5o39deuBd\nXUdy2culYQKBgHywCmzrpb39n5hk4JCKAs51zqXoLRL4LPtEDtDjVuTKcBYN9eZZ\nIfkOkciyJVGanrzrGenQwHlmHpOEQaq1ge9HQQHy058X5AnF5KOjn24BleY//FL8\notvAiJymBKc0BnN3TsJWtA/AVITwJaE0nCIns2QGFrofTBrKNajGUXZBAoGBAIAG\nDC8sHHRh2d5aG7zoM/E9UCskM9jkRevGQ3Q6GPSbBud46/x32AoA2l2e9Lr5jw7B\nKSrrRQmNNmPyE9NZPmWvMsP2QGIvIB3G0n5T+8cH5dViH6w3yp4ND9lCr0wW28Wl\nt0Eu9pwefULCUlpr2xZPNUUY72qrQcgsbeUvxtmBAoGBAPPY08wt8K5+lQ4K4oj9\ngz6QmSNe42FeQuBPU1FeqoUZgzUMYh2fKGUZde6drb5UxLZnRJEDD6OIjUSXQ+1/\nDRjr3O6mSdNAAof3VK2tqBTdzQf4XElRgl5fh1lXONRCAOjdoog+BSxt9q/JZNq+\n/c9c3Ne3y32/hQ5pItFogj1/\n-----END PRIVATE KEY-----\n',
      client_email: 'lubestation-orders@lunar-spring-434604-b3.iam.gserviceaccount.com',
      client_id: '116906387110698781015',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/lubestation-orders%40lunar-spring-434604-b3.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    };
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
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

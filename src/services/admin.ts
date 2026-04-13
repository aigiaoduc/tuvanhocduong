import { GOOGLE_SCRIPT_URL } from '../config';

export const adminLogin = async (username: string, password: string): Promise<boolean> => {
  if (!GOOGLE_SCRIPT_URL) return true; // Bypass for dev if no URL
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=adminLogin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    const result = await response.json();
    return result.status === 'success';
  } catch (e) {
    console.error("Lỗi đăng nhập admin:", e);
    return false;
  }
};

export const fetchAllData = async () => {
  if (!GOOGLE_SCRIPT_URL) return null;
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData`);
    const result = await response.json();
    if (result.status === 'success') {
      return result.data;
    }
    return null;
  } catch (e) {
    console.error("Lỗi lấy dữ liệu admin:", e);
    return null;
  }
};

export const deleteRow = async (sheetName: string, rowIndex: number) => {
  if (!GOOGLE_SCRIPT_URL) return;
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteRow', sheet: sheetName, rowIndex })
    });
  } catch (e) {
    console.error("Lỗi xóa dòng:", e);
  }
};

export const updateReportStatus = async (rowIndex: number, status: string) => {
  if (!GOOGLE_SCRIPT_URL) return;
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateReportStatus', sheet: 'Reports', rowIndex, status })
    });
  } catch (e) {
    console.error("Lỗi cập nhật trạng thái:", e);
  }
};

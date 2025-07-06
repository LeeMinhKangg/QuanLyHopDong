import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users'; // URL của backend

// Lấy danh sách người dùng
export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    throw error;
  }
};

// Tạo người dùng mới
export const createUser = async (userData: any) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo người dùng:', error);
    throw error;
  }
};

// Cập nhật người dùng
export const updateUser = async (id: any, userData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error);
    throw error;
  }
};

// Xóa người dùng
export const deleteUser = async (id: any) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    throw error;
  }
};
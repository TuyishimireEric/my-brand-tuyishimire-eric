import { API_URL } from '../utils.js';

export const addBlogComment = async (blogId, formData) => {
    try {
        const response = await fetch(`${API_URL}/api/blogs/${blogId}/comments`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        return error.message;
    }
}

export const getBlogComments = async (blogId) => {
    try {
        const response = await fetch(`${API_URL}/api/blogs/${blogId}/comments`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        return result;
    } catch (error) {
        return error.message;
    }
    
}
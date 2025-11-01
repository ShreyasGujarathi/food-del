import React, { useState, useContext, useEffect } from 'react'
import './Add.css'
import { assets } from '../../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../../Context/StoreContext';

const Add = () => {
    const { url } = useContext(StoreContext);

    const [image, setImage] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryImage, setCategoryImage] = useState(null);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: ""
    });

    const token = localStorage.getItem('token');

    // Fetch existing categories
    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${url}/api/category`);
            if (response.data.success) {
                setCategories(response.data.data);
                if (response.data.data.length > 0 && !data.category) {
                    setData(prev => ({ ...prev, category: response.data.data[0].name }));
                }
            } else {
                // Fallback to old API if category API doesn't work
                const fallbackResponse = await axios.get(`${url}/api/food/categories`);
                if (fallbackResponse.data.success && fallbackResponse.data.data.length > 0) {
                    const simpleCategories = fallbackResponse.data.data.map(cat => ({ name: cat, image: null }));
                    setCategories(simpleCategories);
                    setData(prev => ({ ...prev, category: simpleCategories[0].name }));
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // Add new category with optional image
    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast.error("Category name is required");
            return;
        }

        if (categories.some(cat => cat.name === newCategory.trim())) {
            toast.error("Category already exists");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", newCategory.trim());
            if (newCategoryImage) {
                formData.append("image", newCategoryImage);
            }

            const response = await axios.post(`${url}/api/category/add`, formData, {
                headers: { token }
            });

            if (response.data.success) {
                toast.success("Category added successfully!");
                setNewCategory("");
                setNewCategoryImage(null);
                setShowAddCategory(false);
                await fetchCategories();
                setData(prev => ({ ...prev, category: newCategory.trim() }));
            } else {
                toast.error(response.data.message || "Failed to add category");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error adding category");
        }
    };

    // Update category image
    const handleUpdateCategoryImage = async (categoryId) => {
        if (!categoryImage) {
            toast.error("Please select an image");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("categoryId", categoryId);
            formData.append("image", categoryImage);

            const response = await axios.post(`${url}/api/category/update-image`, formData, {
                headers: { token }
            });

            if (response.data.success) {
                toast.success("Category image updated!");
                setCategoryImage(null);
                setEditingCategory(null);
                await fetchCategories();
            } else {
                toast.error(response.data.message || "Failed to update image");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating image");
        }
    };

    // Delete category
    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone if there are no food items using this category.`)) {
            return;
        }

        try {
            const response = await axios.post(`${url}/api/category/delete`, 
                { categoryId }, 
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success("Category deleted successfully!");
                await fetchCategories();
                // Reset category selection if deleted category was selected
                const updatedCategories = await axios.get(`${url}/api/category`);
                if (updatedCategories.data.success && updatedCategories.data.data.length > 0) {
                    setData(prev => ({ ...prev, category: updatedCategories.data.data[0].name }));
                } else {
                    setData(prev => ({ ...prev, category: "" }));
                }
            } else {
                toast.error(response.data.message || "Failed to delete category");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error deleting category");
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Image not selected');
            return null;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("image", image);
        
        try {
            const response = await axios.post(`${url}/api/food/add`, formData, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success(response.data.message)
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: data.category
                })
                setImage(false);
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error adding food item");
        }
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Upload image</p>
                    <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = '' }} type="file" accept="image/*" id="image" hidden />
                    <label htmlFor="image">
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                    </label>
                </div>
                <div className='add-product-name flex-col'>
                    <p>Product name</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Type here' required />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Product description</p>
                    <textarea name='description' onChange={onChangeHandler} value={data.description} type="text" rows={6} placeholder='Write content here' required />
                </div>
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap'}}>
                            <p style={{margin: 0}}>Product category</p>
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowAddCategory(!showAddCategory);
                                    setEditingCategory(null);
                                }}
                                className="add-category-btn"
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {showAddCategory ? 'Cancel' : '+ Add Category'}
                            </button>
                        </div>
                        
                        {/* Add new category form */}
                        {showAddCategory && (
                            <div style={{padding: '15px', border: '2px solid var(--bg-light)', borderRadius: '8px', marginBottom: '10px', background: 'var(--bg-light)'}}>
                                <input 
                                    type="text" 
                                    placeholder="New category name"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        border: '2px solid var(--bg-light)',
                                        borderRadius: '4px',
                                        marginBottom: '10px',
                                        width: '100%'
                                    }}
                                />
                                <div style={{marginBottom: '10px'}}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        id="category-image" 
                                        hidden 
                                        onChange={(e) => {
                                            setNewCategoryImage(e.target.files[0]);
                                            e.target.value = '';
                                        }}
                                    />
                                    <label htmlFor="category-image" style={{
                                        display: 'block',
                                        padding: '8px 12px',
                                        background: 'var(--bg-white)',
                                        border: '2px dashed var(--primary-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontSize: '14px'
                                    }}>
                                        {newCategoryImage ? newCategoryImage.name : '+ Add Category Image (Optional)'}
                                    </label>
                                    {newCategoryImage && (
                                        <img src={URL.createObjectURL(newCategoryImage)} alt="Preview" style={{
                                            width: '60px',
                                            height: '60px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            marginTop: '8px'
                                        }} />
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleAddCategory}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--primary-color)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        width: '100%'
                                    }}
                                >
                                    Add Category
                                </button>
                            </div>
                        )}

                        {/* Category selection dropdown with images */}
                        <select name='category' onChange={onChangeHandler} value={data.category} required>
                            <option value="">Select a category</option>
                            {categories.map((cat, idx) => (
                                <option key={cat._id || idx} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>

                        {/* Category management section */}
                        {categories.length > 0 && (
                            <div style={{marginTop: '20px', padding: '15px', border: '2px solid var(--bg-light)', borderRadius: '8px'}}>
                                <p style={{margin: '0 0 15px 0', fontWeight: '600'}}>Manage Categories</p>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto'}}>
                                    {categories.map((cat) => (
                                        <div key={cat._id || cat.name} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px',
                                            background: 'var(--bg-white)',
                                            borderRadius: '6px',
                                            border: '1px solid var(--bg-light)'
                                        }}>
                                            {/* Category image */}
                                            {cat.image ? (
                                                <img src={`${url}/images/${cat.image}`} alt={cat.name} style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }} />
                                            ) : (
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    background: 'var(--bg-light)',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    color: 'var(--text-light)'
                                                }}>No img</div>
                                            )}
                                            
                                            <span style={{flex: 1, fontWeight: '500'}}>{cat.name}</span>
                                            
                                            {/* Edit image button */}
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                {editingCategory === cat._id ? (
                                                    <>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            id={`edit-image-${cat._id}`} 
                                                            hidden 
                                                            onChange={(e) => {
                                                                setCategoryImage(e.target.files[0]);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <label htmlFor={`edit-image-${cat._id}`} style={{
                                                            padding: '6px 12px',
                                                            background: 'var(--primary-color)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}>Choose Image</label>
                                                        {categoryImage && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateCategoryImage(cat._id)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: 'green',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px'
                                                                }}
                                                            >Save</button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCategory(null);
                                                                setCategoryImage(null);
                                                            }}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: 'gray',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }}
                                                        >Cancel</button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingCategory(cat._id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#4CAF50',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >Add/Edit Image</button>
                                                )}
                                                
                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#f44336',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='add-price flex-col'>
                        <p>Product Price</p>
                        <input type="Number" name='price' onChange={onChangeHandler} value={data.price} placeholder='25' required />
                    </div>
                </div>
                <button type='submit' className='add-btn' >ADD</button>
            </form>
        </div>
    )
}

export default Add


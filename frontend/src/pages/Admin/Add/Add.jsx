import React, { useState, useContext, useEffect } from 'react'
import './Add.css'
import { assets } from '../../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../../Context/StoreContext';

const Add = () => {
    const { url } = useContext(StoreContext);

    const [image, setImage] = useState(false);
    const [categories, setCategories] = useState(["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"]);
    const [newCategory, setNewCategory] = useState("");
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Salad"
    });

    const token = localStorage.getItem('token');

    // Fetch existing categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/api/food/categories`);
                if (response.data.success && response.data.data.length > 0) {
                    setCategories(response.data.data);
                    setData(prev => ({ ...prev, category: response.data.data[0] }));
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, [url]);

    // Add new category
    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setData({ ...data, category: newCategory.trim() });
            setNewCategory("");
            setShowAddCategory(false);
            toast.success("Category added! You can now select it.");
        } else if (categories.includes(newCategory.trim())) {
            toast.error("Category already exists");
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
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                            <p style={{margin: 0}}>Product category</p>
                            <button 
                                type="button"
                                onClick={() => setShowAddCategory(!showAddCategory)}
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
                        {showAddCategory && (
                            <div style={{display: 'flex', gap: '8px', marginBottom: '10px'}}>
                                <input 
                                    type="text" 
                                    placeholder="New category name"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        border: '2px solid var(--bg-light)',
                                        borderRadius: '4px',
                                        flex: 1
                                    }}
                                />
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
                                        fontWeight: '600'
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        )}
                        <select name='category' onChange={onChangeHandler} value={data.category}>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
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


import React, { useContext, useEffect, useState } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { menu_list as defaultMenuList } from '../../assets/assets'

const ExploreMenu = ({category,setCategory}) => {

  const {url, menu_list: contextMenuList} = useContext(StoreContext);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    // Initialize with default menu list first
    const fallbackList = contextMenuList || defaultMenuList;
    const defaultCategories = fallbackList.map(item => item.menu_name);
    const imageMap = {};
    fallbackList.forEach(item => {
      imageMap[item.menu_name] = item.menu_image;
    });
    
    // Set defaults immediately
    setDynamicCategories(defaultCategories);
    setCategoryImages(imageMap);
    
    // Then try to fetch from API and merge new categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url}/api/food/categories`);
        if (response.data && response.data.success && response.data.data) {
          const apiCategories = response.data.data || [];
          
          // Merge default categories with API categories (avoid duplicates)
          const allCategories = [...defaultCategories];
          apiCategories.forEach(cat => {
            if (!allCategories.includes(cat)) {
              allCategories.push(cat);
              // Assign default image for new categories
              imageMap[cat] = defaultMenuList[0]?.menu_image || fallbackList[0]?.menu_image;
            }
          });
          
          setDynamicCategories(allCategories);
          setCategoryImages(imageMap);
        }
      } catch (error) {
        // Silently ignore - already using defaults
        console.log("Using default categories");
      }
    };
    
    // Only fetch if URL is available
    if (url) {
      fetchCategories();
    }
  }, [url, contextMenuList, defaultMenuList]);

  // Use dynamic categories if available, otherwise fallback to menu_list from context or default
  const menuListToUse = dynamicCategories.length > 0
    ? dynamicCategories.map(catName => ({
        menu_name: catName,
        menu_image: categoryImages[catName] || (contextMenuList || defaultMenuList)[0]?.menu_image
      }))
    : (contextMenuList || defaultMenuList);
  
  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our menu</h1>
      <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
      <div className="explore-menu-list">
        {menuListToUse.map((item,index)=>{
            return (
                <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='explore-menu-list-item'>
                    <img src={item.menu_image} className={category===item.menu_name?"active":""} alt="" />
                    <p>{item.menu_name}</p>
                </div>
            )
        })}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu

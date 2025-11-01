import React, { useEffect, useState, useContext } from 'react'
import './List.css'
import { StoreContext } from '../../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {
  const { url, currency } = useContext(StoreContext);
  const [list, setList] = useState([]);
  const token = localStorage.getItem('token');

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`)
    if (response.data.success) {
      setList(response.data.data);
    }
    else {
      toast.error("Error")
    }
  }

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, {
        id: foodId
      }, {
        headers: { token }
      })
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      }
      else {
        toast.error("Error")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing food item");
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className='list-table'>
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          // Handle image URL - if it's a full URL (GitHub raw), use it directly, otherwise prepend backend URL
          const getImageUrl = () => {
            if (!item.image) return '';
            if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
              return item.image;
            }
            return `${url}/images/${item.image}`;
          };

          return (
            <div key={index} className='list-table-format'>
              <img src={getImageUrl()} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p className='cursor' onClick={() => removeFood(item._id)}>x</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default List


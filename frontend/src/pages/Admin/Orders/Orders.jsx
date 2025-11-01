import React, { useEffect, useState, useContext } from 'react'
import './Orders.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../../assets/assets';
import { StoreContext } from '../../../Context/StoreContext';

const Orders = () => {
  const { url, currency } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`, {
        headers: { token }
      })
      if (response.data.success) {
        setOrders(response.data.data.reverse());
      }
      else {
        toast.error("Error")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching orders");
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: event.target.value
      }, {
        headers: { token }
      })
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating order status");
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [])

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className='order-item'>
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className='order-item-food'>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  }
                  else {
                    return item.name + " x " + item.quantity + ", "
                  }
                })}
              </p>
              <p className='order-item-name'>{order.address.firstName + " " + order.address.lastName}</p>
              <div className='order-item-address'>
                <p>{order.address.street + ","}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
            </div>
            <p>Items : {order.items.length}</p>
            <p>{currency}{order.amount}</p>
            <select onChange={(e) => statusHandler(e, order._id)} value={order.status} name="" id="">
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders


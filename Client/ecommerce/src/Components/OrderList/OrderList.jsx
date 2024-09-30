import React, { useContext, useEffect, useState } from 'react'
import './OrderList.css'

import { CiSearch } from "react-icons/ci";

import axios from "axios"
import { Context } from '../../context';

const OrderList = () => {

  const { user } = useContext(Context)

  const [orders, setOrders] = useState([]);
  const [noOrders, setNoOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");


  const handleOnChange = (e) => {
    setInput(e.target.value); // Update the state with the new input value
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/orders/search/${input}`); // Make an API call to search for the order
      if (response.data.success) {
        setNoOrders(false)
        setOrders([response.data.data]); // Set orders state with the specific order found
      } else {
        setNoOrders(true); // Clear orders if no match found
      }
    } catch (error) {
      setNoOrders(true);
      console.error('Error searching order:', error);
    }
  };


  // fetch objednávek
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const userId = user._id
          const response = await axios.get(`/orders/${userId}`);
          if (response.data.success) {
            setOrders(response.data.data);
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          console.error('Error fetching orders:', error);
        }
      };
      fetchOrders();
    } else {
      setOrders([])
      setLoading(false)
    }
  }, [user]);

  // zrušení objednávky
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(`/orders/${orderId}/cancel`);
      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, status: 'Zrušeno' } : order
          )
        );
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  if (loading) return <div className='orderList'></div>;

  return (
    <div className='orderList'>
      <h1>Vaše objednávky</h1>

      {!user ? <div className='orderList-search'>
        <div className='orderList-search-wrapper'>
          <CiSearch />
          <input type="text" placeholder='Zadejte číslo objednávky' onChange={handleOnChange} />
        </div>
        <button onClick={handleSearch}>Zjistit stav</button>
      </div> : ""}



      {orders.length > 0 ?
        <div className='orderList-titles'>
          <div className='orderList-titles-date'>Datum založení</div>
          <div className='orderList-titles-number'>Číslo objednávky</div>
          <div className='orderList-titles-state'></div>
          {user ? <div className='orderList-titles-cancel'></div> : ""}
        </div>
        : user ? <span>Nemáte dosud žádné objednávky</span> : noOrders ? <span style={{marginTop: "30px", color: "red"}}>Objednávka nebyla nalezena</span> : ""}


      <div className='orderList-content'>
        {orders.map((order) => (
          <div key={order._id} className='orderList-content-wrapper'>
            <div className='orderList-content-wrapper-wrapper'>
              <div className='orderList-content-wrapper-wrapper-date'>
                <span>{order.createdDate}</span>
              </div>
              <div className='orderList-content-wrapper-wrapper-number'>
                <span>{order._id}</span>
              </div>
            </div>
            <div className='orderList-content-wrapper-wrapper'>
              <div className='orderList-content-wrapper-wrapper-state'>
                <span className={order.status === "Vyřizuje se" ? "orderList-content-wrapper-wrapper-state-pending" : order.status === "Vyřízeno" ? "orderList-content-wrapper-wrapper-state-done" : "orderList-content-wrapper-wrapper-state-canceled"}>{order.status}</span>
              </div>
              {user ? <div className='orderList-content-wrapper-wrapper-cancel'>
                {order.status === "Vyřizuje se" ?
                  <button onClick={() => handleCancelOrder(order._id)}>Zrušit objednávku</button>
                  : ""}
              </div>: ""}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default OrderList
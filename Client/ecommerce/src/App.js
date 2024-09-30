// npm install emailjs-com
// npm install react-icons --save
// npm i react-router-dom

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Cart from './Pages/Cart';
import Orders from './Pages/Orders';
import Product from './Pages/Product';
import Settings from './Pages/Settings';
import { ContextProvider } from './context';
import Checkout from './Pages/Checkout';

function App() {
  return (
    <ContextProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kosik" element={<Cart />} />
            <Route path="/objednavky" element={<Orders />} />
            <Route path="/produkt/:id" element={<Product />} />
            <Route path="/nastaveni" element={<Settings />} />
            <Route path="/kosik/pokladna" element={<Checkout />} />
          </Routes>
        </Router>
      </div>
    </ContextProvider>
  );
}

export default App;

import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Box,
  Typography
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(0)
  const [fetchedCart, setFetchedCart] = useState([])
  const [cartList, setCartList] = useState([])

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {    
    try {
    const url = `${config.endpoint}/products`
    const response = await axios.get(url)
    const data = response.data
    setIsLoading(false)
    // setProducts(data)
    console.log(data)
    return data
  } catch (error) {
    setIsLoading(false)
    setProducts([])
    enqueueSnackbar(error.response.data.message, { variant: "error" });
  }
  }

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    let erres = null;
    try {
      const url = config.endpoint + `/products/search?value=${text}`;
      const response = await axios.get(url);

      if (response) {
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        erres = error.response;
      } else {
        console.log(error);
      }
    }
    if (erres)
      return erres.data;
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout !== 0) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(async () => {
      setProducts(await performSearch(event.target.value));
    }, 500);
    setDebounceTimeout(timeout);
  };


  const fetchCart = async (token) => {
    if (!token) return;

    try {

      const response = await axios.get(config.endpoint + "/cart", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = response.data

      //console.log(data);

      return data
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  useEffect(() => {
    // code to run after render goes here
    const callApi = async () => {
      setIsLoading(true)
      const getProducts = await performAPICall();
      setIsLoading(false)
      setProducts(getProducts);
      // if (localStorage.getItem('username')) {
      //   const getCart = await fetchCart(localStorage.getItem("token"))
      //   // setFetchedCart(getCart)
      //   // setCartList(generateCartItemsFrom(getCart, getProducts))
      // }
      const getCart = await fetchCart(localStorage.getItem("token"))
      setFetchedCart(getCart)
      setCartList(generateCartItemsFrom(getCart, getProducts))
      // console.log("inside useeffect",fetchedcart,res)
    };
    callApi();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */

  const isItemInCart = (items, productId) => {
    const prodIds = items.map((item) => {
      return item.productId;
    })
    return (prodIds.includes(productId));
  };


  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    try {
      // console.log(token,items,products,productId,qty,options)
      if (!token) {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "warning",
        });
      } else if (options.preventDuplicate && isItemInCart(items, productId)) {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          { variant: "warning" }
        );
      } else {
        //console.log(token,items,products,productId,qty,options)
        const res = await axios.post(
          `${config.endpoint}/cart`,
          { productId: productId, qty: qty },
          {
            headers: { Authorization: "Bearer " + token }
          }
        );

        setFetchedCart(res.data);
        setCartList(generateCartItemsFrom(res.data, products));

      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    }
  };

  return (
    <div>
      <Header
      
      children={
        (<div className="search">
          <TextField
            className="search-desktop"
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
            onChange={(e) => {
              debounceSearch(e, debounceTimeout);
            }}
          />
        </div>)
      }

      hasHiddenAuthButtons={false}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        fullWidth
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        //value={search}
        onChange={(e) => {
          debounceSearch(e, debounceTimeout);
        }}
      />

      <Grid container spacing={2} sx={{ display: "flex" }}>
        <Grid item md={localStorage.getItem("username") ? 8 : 12} xs={12}>
          <Box>
            <Grid container>
              <Grid item className="product-grid">
                <Box className="hero">
                  <p className="hero-heading">
                    India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                    to your door step
                  </p>
                </Box>
              </Grid>
            </Grid>

            {
               isLoading ?
               <div className="loading">
                 <CircularProgress />
                 <Typography variant="p" sx={{ marginTop: "1rem" }}>Loading Products</Typography>
               </div> :
               (products.length === 0 ?
                 <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                   <SentimentDissatisfied />
                   <Typography variant="p" sx={{ marginTop: "1rem" }}>No Products found</Typography>
                 </Grid> :
                 (
                   <Grid container spacing={2} sx={{ padding: "3rem 1rem" }} >
                     {
                       products && products.map(product => (
                         <Grid item md={3} sm={6} xs={12} key={product._id} >
                           <ProductCard
                             product={product}
                             handleAddToCart={() => addToCart(
                              localStorage.getItem("token"),
                              fetchedCart,
                              products,
                              product._id,
                              1,
                              { preventDuplicate: true }
                            )} />
                        </Grid>
                      ))

                    }
                  </Grid>
                ))
          }
        </Box>
      </Grid>
      {/* Cart */}
      {
        localStorage.getItem("username") ?
          <Grid item md={4} xs={12} sx={{ md: { width: "25%" }, backgroundColor: "#E9F5E1", height: "100vh", marginTop: "18px" }}>
            <Box >
              <Cart products={products} items={cartList} handleQuantity={addToCart} />

            </Box>
          </Grid> :
          null
      }
    </Grid>
    <Footer />
  </div>
);
};

export default Products;

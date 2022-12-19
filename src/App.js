import { ThemeProvider } from "@emotion/react";
import Login from "./components/Login";
import { Switch, Route } from "react-router-dom";
import Register from "./components/Register";
import Product from "./components/Products";
import ipConfig from "./ipConfig.json";
import theme from "./theme";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";
// eslint-disable-next-line
import React, { useEffect, useState } from "react";


export const config = {
  endpoint: `https://qkart-frontend-web.herokuapp.com/api/v1`,
};

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <div className="App">
          <Switch>
            <Route exact path="/" component={Product} />
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/thanks" component={Thanks} />
          </Switch>
        </div>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default App;

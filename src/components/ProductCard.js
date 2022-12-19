import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
   <Card className="card">
      <CardMedia
        component="img"
        height="140"
        image={product.image}
        alt="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold" }} color="#000">
          ${product.cost}
        </Typography>
        <Rating name="read-only" value={product.rating} readOnly />
      </CardContent>
      <Button variant="contained" onClick={handleAddToCart}>
        {" "}
        <AddShoppingCartOutlined /> ADD TO CART
      </Button>
    </Card>
  );
};

export default ProductCard;

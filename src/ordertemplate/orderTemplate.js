"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orderTemplate = (rows) => {
    return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Order</title>
  <style>
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box; 
    font-family: system-ui;
  }
  table {
    width: 50%;
    margin: auto;
    border-collapse: collapse;
  }
  table, th, td {
    border: 1px solid black;
    text-align: center;
  }
  th, td {
    padding: 10px;
  }
  th {
    background-color: #FFD7C4;
    color: black;
    font-size: 20px;
    line-height: 24px;
  }
  td {
    font-size: 16px;
  }
  </style>
</head>
<body>
  <center>
    <h1>Your order</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        ${rows} 
      </tbody>
    </table>
  </center>
</body>
</html>

    `;
};
exports.default = orderTemplate;

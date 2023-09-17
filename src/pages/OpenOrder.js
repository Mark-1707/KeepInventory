import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Button,
  TextInput,
  Modal,
  Portal,
  Searchbar,
  Divider,
  List,
} from 'react-native-paper';
import {Alert} from 'react-native';

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

import DropDown from 'react-native-paper-dropdown';
import {DatePickerModal} from 'react-native-paper-dates';
import {useDispatch, useSelector} from 'react-redux';
import {
  customersSelector,
  getCustomerMethod,
} from '../slices/customers/getcutomers';

import {
  productSelector,
  getProductMethod,
} from '../slices/products/getproducts';

import {
  createOrderSelector,
  createOrderMethod,
  resetMethod,
} from '../slices/orders/createorder';
import url from '../../utils/url';
import {ACCESS_FUN} from '../../utils/getRights';
import {useFocusEffect} from '@react-navigation/native';

export default function CreateOrder({navigation, route}) {
  const userData = useSelector(state => state.login);
  const dispatch = useDispatch();
  const {allcustomers} = useSelector(customersSelector);

  const {products} = useSelector(productSelector);

  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [presentProducts, setPresentProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProduct, setNewProduct] = useState({});
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visible, setVisible] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [updateProductId, setUpdateProductId] = useState(null);
  const [data, setData] = useState({
    user_id: userData.login.id,
    bookingDate: selectedDate,
  });
  const [gst_number, setGst_number] = useState(null);
  const [order_id, setOrder_id] = useState(null);
  const [orderStatus, setOrderStatus] = useState(false);

  const [editOrdersRights, setEditeOrdersRights] = useState(false);

  useEffect(() => {
    async function getRights() {
      let result = await ACCESS_FUN(data.user_id);
      setEditeOrdersRights(result['can_edit_orders']);
    }

    getRights();
  }, []);

  function formatDate(date) {
    const options = {
      weekday: 'long', // Display the full weekday name
      day: 'numeric', // Display the day of the month
      month: 'long', // Display the full month name
      year: 'numeric', // Display the year
    };

    // Format the date using the specified options
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(
      date,
    );

    // Extract the day part of the date
    const day = date.getDate();

    // Determine the suffix for the day (e.g., "th," "st," "nd," or "rd")
    let daySuffix;
    if (day >= 11 && day <= 13) {
      daySuffix = 'th';
    } else {
      switch (day % 10) {
        case 1:
          daySuffix = 'st';
          break;
        case 2:
          daySuffix = 'nd';
          break;
        case 3:
          daySuffix = 'rd';
          break;
        default:
          daySuffix = 'th';
      }
    }

    // Add the day suffix to the formatted date
    return formattedDate.replace(/\d+/, day + daySuffix);
  }

  const generatePDF = async () => {
    setIsLoading(true);
    try {
      const html = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Helvetica';
                font-size: 12px;
              }
              header, footer {
                height: 50px;
                background-color: #fff;
                color: #000;
                display: flex;
                justify-content: center;
                padding: 0 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #000;
                padding: 5px;
              }
              th {
                background-color: #ccc;
              }
              .id{
                width: 10px;
              }
            </style>
          </head>
          <body>
            <table>
              <tr>
                <th>Customer Name</th>
                <td>${selectedCustomer}
                </td>
                ${
                  gst_number !== null &&
                  gst_number !== undefined &&
                  gst_number !== ''
                    ? `
        <th>GST Number</th>
        <td>${gst_number}</td>`
                    : ''
                }
              </tr>
              <tr>
                <th>Order Date</th>
                <td>${formatDate(new Date(selectedDate))}</td>
                <th></th><td></td>
              </tr>
            </table>
            <table>
              <tr>
                <th class="id">Product ID</th>
                <th>Product Name</th>
                <th>Product Qty</th>
              </tr>
              ${presentProducts
                .map(
                  (product, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product.name}</td>
                  <td>${product.quantity}${product.unit}</td>
                </tr>
              `,
                )
                .join('')}
            </table>
            <footer>
              <p>Thank you for your business!</p>
            </footer>
          </body>
        </html>
      `;
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth() + 1; // Months are zero-based, so add 1
      const year = selectedDate.getFullYear();
      const fullDate = `${day}-${month}-${year}`;
      const options = {
        html,
        fileName: `invoice_${order_id}`,
        directory: `Invoices/${fullDate}`,
      };
      const file = await RNHTMLtoPDF.convert(options);

      // Define the share options
      const shareOptions = {
        title: 'Share PDF',
        message: 'Here is your Invoice to share',
        url: `file://${file.filePath}`,
        type: 'application/pdf',
      };

      // await Share.open(shareOptions);

      Alert.alert('Success', `PDF saved to ${file.filePath}`);
      setCount(count + 1);
      setIsLoading(false);
    } catch (e) {
      Alert.alert('Error', e);
    }
  };

  console.log(route.params.order_id);

  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);
        const response = await fetch(`${url}/getorderbyid`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({orderId: route.params.order_id}),
        });

        const res = await response.json();
        console.log(res);
        if (res.status) {
          setPresentProducts(res.data.products);
          setSelectedCustomer(res.data.order.customer_name);
          setSelectedDate(new Date(res.data.order.timezone));
          setOrderStatus(res.data.order.status);
          setGst_number(res.data.order.gst_number);
          setOrder_id(res.data.order.order_id);
          setLoading(false);
        } else {
          setHasErrors(true);
          setLoading(false);
        }
      } catch (e) {
        console.log(e);
        setHasErrors(true);
        setLoading(false);
      }
    }

    if (route.params.order_id) {
      getData();
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const onChangeProductSearch = query => setProductSearchQuery(query);

  const showProductsModal = () => setProductModalVisible(true);
  const hideProductsModal = () => setProductModalVisible(false);

  const showDatePickerFun = () => {
    setShowDatePicker(true);
  };

  const hideDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleConfirm = date => {
    console.log(date);
    setSelectedDate(date);
    hideDatePicker();
    setData(old => {
      return {...old, bookingDate: date};
    });
  };

  useEffect(() => {
    let data = {
      user_id: userData.login.id,
      role: userData.login.role,
    };
    dispatch(getProductMethod(data));
  }, [dispatch]);

  const takeProduct = () => {
    if (newProductName && newProductQuantity) {
      console.log('Helloo', updateProductId);
      const dataToSet = [
        ...presentProducts,
        {
          name: newProductName,
          quantity: newProductQuantity,
          productId: newProduct.id,
          unit: newProduct.unit,
        },
      ];

      setPresentProducts([
        ...presentProducts,
        {
          name: newProductName,
          quantity: newProductQuantity,
          productId: newProduct.id,
          unit: newProduct.unit,
        },
      ]);

      setData(old => {
        return {...old, products: dataToSet};
      });

      setNewProductName('');
      setNewProductQuantity('');
    }
  };

  const addProduct = () => {
    if (newProductQuantity > newProduct.quantity) {
      Alert.alert(
        'Stock not available',
        'Do you want to continue with the order?',
        [
          {
            text: 'Yes',
            onPress: () => {
              takeProduct();
            },
          },
          {
            text: 'No',
            onPress: () => {
              return;
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      takeProduct();
    }
  };

  const removeProduct = index => {
    const dataToSet = [
      ...presentProducts.slice(0, index),
      ...presentProducts.slice(index + 1),
    ];

    setPresentProducts([
      ...presentProducts.slice(0, index),
      ...presentProducts.slice(index + 1),
    ]);

    setData(old => {
      return {...old, products: dataToSet};
    });
  };

  const [newProductUnit, setNewProductUnit] = useState('');

  const editProduct = index => {
    setNewProductName(presentProducts[index].name);
    setNewProductQuantity(presentProducts[index].quantity);
    setNewProductUnit(presentProducts[index].unit);
    setNewProduct(old => {
      return {...old, id: presentProducts[index].product_id};
    });
    setPresentProducts([
      ...presentProducts.slice(0, index),
      ...presentProducts.slice(index + 1),
    ]);
  };

  const updateOrder = async () => {
    const dataToSet = {
      ...data,
      products: presentProducts,
      orderId: route.params.order_id,
    };
    setLoading(true);
    try {
      const response = await fetch(`${url}/updateorder`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSet),
      });

      const res = await response.json();

      if (res.status) {
        Alert.alert('Success', res.message, [
          {
            text: 'OK',
            onPress: () => {
              dispatch(resetMethod());
              navigation.navigate('Orders');
            },
          },
        ]);
        setLoading(false);
      } else {
        Alert.alert('Error', res.message);
        setHasErrors(true);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      setHasErrors(true);
      setLoading(false);
    }

    // dispatch(createOrderMethod(dataToSet));
  };

  const markOrder = async () => {
    const dataToSet = {
      orderId: route.params.order_id,
      status: !orderStatus,
    };
    setLoading(true);
    try {
      const response = await fetch(`${url}/markorder`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSet),
      });

      const res = await response.json();

      if (res.status) {
        setOrderStatus(!orderStatus);
        Alert.alert('Success', res.message, [
          {
            text: 'OK',
            onPress: () => {
              return;
            },
          },
        ]);
        setLoading(false);
      } else {
        Alert.alert('Error', res.message);
        setHasErrors(true);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      setHasErrors(true);
      setLoading(false);
    }
  };

  const hideErrorModal = () => {
    setHasErrors(false);
  };

  const renderOrderStatus = () => {
    if (loading) {
      return (
        <Modal
          visible={true}
          onDismiss={hideErrorModal}
          contentContainerStyle={styles.loadingModal}>
          <Text style={styles.modalTitle}>Creating Order</Text>
          <Text style={{textAlign: 'center'}}>Please wait...</Text>
        </Modal>
      );
    }

    if (hasErrors) {
      return (
        <Modal
          visible={true}
          onDismiss={hideErrorModal}
          contentContainerStyle={styles.loadingModal}>
          {/* <Text style={styles.modalTitle}>Order Created</Text> */}
          <Text style={styles.errorText}>
            There was an error while booking your order. Please try again
          </Text>
        </Modal>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Select Date:</Text>
      <Button
        mode="outlined"
        onPress={showDatePickerFun}
        style={styles.dateButton}>
        {selectedDate.toDateString()}
      </Button>
      <DatePickerModal
        mode="single"
        visible={showDatePicker}
        onDismiss={hideDatePicker}
        onConfirm={date => handleConfirm(date.date)}
      />
      <TextInput
        // onFocus={showModal}
        disabled={true}
        label="Customer Name"
        value={selectedCustomer}
        onChangeText={text => setSelectedCustomer(text)}
        style={styles.input}
      />
      <Text style={styles.label}>Products:</Text>
      <TextInput
        label="Product Name"
        onFocus={showProductsModal}
        value={newProductName}
        onChangeText={text => setNewProductName(text)}
        style={styles.input}
      />
      <TextInput
        label={`Quantity: ( In ${newProduct.unit})`}
        value={newProductQuantity}
        onChangeText={text => setNewProductQuantity(text)}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={addProduct} style={styles.addButton}>
        Add Product
      </Button>
      <View style={styles.productList}>
        {presentProducts.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Text style={styles.productText}>
              {product.name} - Quantity: {product.quantity}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <Button
                mode="contained"
                icon={require('../res/images/delete.png')}
                onPress={() => removeProduct(index)}
                style={styles.removeButton}>
                Remove
              </Button>

              <Button
                icon={require('../res/images/edit.png')}
                mode="contained"
                onPress={() => editProduct(index)}
                style={styles.editButton}>
                Edit
              </Button>
            </View>
          </View>
        ))}
      </View>
      {renderOrderStatus()}
      {editOrdersRights && (
        <Button
          mode="contained"
          onPress={updateOrder}
          disabled={!selectedCustomer || presentProducts.length === 0}
          style={styles.createButton}>
          Update Order
        </Button>
      )}

      <Button
        mode="contained"
        onPress={generatePDF}
        disabled={!selectedCustomer || presentProducts.length === 0}
        style={styles.createButton}>
        Print Invoice
      </Button>

      <Button
        mode="contained"
        onPress={markOrder}
        disabled={!selectedCustomer || presentProducts.length === 0}
        style={styles.createButton}>
        {orderStatus ? 'Mark as Pending' : 'Mark as Completed'}
      </Button>

      {/* Modal for Producst */}
      <Portal>
        <Modal
          visible={productModalVisible}
          onDismiss={hideProductsModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Searchbar
              icon={require('../res/images/search.png')}
              placeholder="Search customers"
              onChangeText={onChangeProductSearch}
              value={productSearchQuery}
              style={styles.searchBar}
            />

            <FlatList
              keyboardShouldPersistTaps="handled"
              data={products.filter(product =>
                product.name
                  .toLowerCase()
                  .includes(productSearchQuery.toLowerCase()),
              )}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => {
                    setNewProductName(item.name);
                    setNewProduct(item);
                    hideProductsModal();
                  }}>
                  <List.Item
                    title={item.name}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon={require('../res/images/cube.png')}
                      />
                    )}
                  />
                  <List.Item
                    description="Available Stock"
                    title={`${item.quantity} ${item.unit}`}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon={require('../res/images/stock.png')}
                      />
                    )}
                  />
                  <Divider />
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  label: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateButton: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  input: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  product: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
  },
  productList: {
    marginTop: 10,
  },
  productItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  productText: {
    fontSize: 16,
    color: '#333',
  },
  containerStyle: {
    backgroundColor: 'white',
    padding: 20,
    height: 200,
    width: 200,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#dc3545',
    width: 120,
    marginRight: 10,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#ffc107',
    width: 120,
  },
  loadingModal: {
    // backgroundColor: 'black',
    height: '100%',
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
});

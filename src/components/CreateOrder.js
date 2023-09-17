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

export default function CreateOrder({navigation}) {
  const userData = useSelector(state => state.login);
  const dispatch = useDispatch();
  const {allcustomers} = useSelector(customersSelector);

  const {products} = useSelector(productSelector);

  const {order, loading, hasErrors, message, success} =
    useSelector(createOrderSelector);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [presentProducts, setPresentProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProduct, setNewProduct] = useState({});
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visible, setVisible] = React.useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [data, setData] = useState({
    salesmanId: userData.login.id,
    bookingDate: selectedDate,
  });

  const onChangeCustomerSearch = query => setCustomerSearchQuery(query);
  const onChangeProductSearch = query => setProductSearchQuery(query);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

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
    dispatch(getCustomerMethod());
    dispatch(getProductMethod(data));
  }, [dispatch]);

  const takeProduct = () => {
    if (newProductName && newProductQuantity) {
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
    setPresentProducts([
      ...presentProducts.slice(0, index),
      ...presentProducts.slice(index + 1),
    ]);
  };

  useEffect(() => {
    console.log(order);
    if (success) {
      setSelectedCustomer('');
      setSelectedDate(new Date());
      setPresentProducts([]);
      setNewProductName('');
      setNewProductQuantity('');
      setData({
        salesmanId: userData.login.id,
        bookingDate: selectedDate,
      });
      dispatch(resetMethod());
    }
  }, [order]);

  const createOrder = () => {
    const dataToSet = {
      ...data,
      products: presentProducts,
    };
    console.log(dataToSet);

    dispatch(createOrderMethod(dataToSet));
  };

  const hideErrorModal = () => {
    dispatch(resetMethod());
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
      <TextInput
        onFocus={showModal}
        label="Customer Name"
        value={selectedCustomer}
        onChangeText={text => setSelectedCustomer(text)}
        style={styles.input}
      />
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
              {product.name} - Quantity: {product.quantity} {product.unit}
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

      <Button
        mode="contained"
        onPress={createOrder}
        disabled={!selectedCustomer || presentProducts.length === 0}
        style={styles.createButton}>
        Create Order
      </Button>
      {renderOrderStatus()}

      {/* Modal for customers */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Searchbar
              icon={require('../res/images/search.png')}
              placeholder="Search customers"
              onChangeText={onChangeCustomerSearch}
              value={customerSearchQuery}
              style={styles.searchBar}
            />

            <FlatList
              keyboardShouldPersistTaps="handled"
              data={allcustomers.filter(customer =>
                customer.name
                  .toLowerCase()
                  .includes(customerSearchQuery.toLowerCase()),
              )}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => {
                    setSelectedCustomer(item.name);
                    setData(old => {
                      return {...old, customerId: item.id};
                    });
                    hideModal();
                  }}>
                  <List.Item
                    title={item.name}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon={require('../res/images/user.png')}
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
    width: 10,
    marginRight: 10,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#ffc107',
    width: 10,
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

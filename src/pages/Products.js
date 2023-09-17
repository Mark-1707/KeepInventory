import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {
  Searchbar,
  FAB,
  List,
  Divider,
  Button,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import {ACCESS_FUN} from '../../utils/getRights';

import {ActivityIndicator, MD2Colors} from 'react-native-paper';

import {
  addProductSelector,
  addProductMethod,
} from '../slices/products/addproducts';

import {
  productSelector,
  getProductMethod,
} from '../slices/products/getproducts';

import {getUnitsMethod, addUnitSelector} from '../slices/units/addunits';

import {useDispatch, useSelector} from 'react-redux';

const Products = () => {
  const userData = useSelector(state => state.login);

  const [isForUpdate, setIsForUpdate] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productsState, setProductsState] = useState([]);
  const [unitModal, setUnitModal] = useState(false);
  const [data, setData] = useState({
    user_id: userData.login.id,
    role: userData.login.role,
  });

  const dispatch = useDispatch();
  const {product, loading, hasErrors, success} =
    useSelector(addProductSelector);

  const {
    products,
    productLoading,
    productHasErrors,
    productSuccess,
    errorMessage,
  } = useSelector(productSelector);

  const [createOrderRight, setCreateOrderRight] = useState(false);
  const [editOrderRight, setEditOrderRight] = useState(false);
  const [deleteOrderRight, setDeleteOrderRight] = useState(false);

  const {unitsArray} = useSelector(addUnitSelector);

  const onChangeSearch = query => setSearchQuery(query);

  useEffect(() => {
    dispatch(getUnitsMethod());
  }, [dispatch]);

  useEffect(() => {
    async function getRights() {
      let result = await ACCESS_FUN(data.user_id);
      setCreateOrderRight(result['can_add_products']);
      setEditOrderRight(result['can_edit_products']);
      setDeleteOrderRight(result['can_remove_products']);
    }

    getRights();
  }, []);

  const authObject = {
    user_id: userData.login.id,
    role: userData.login.role,
  };

  useEffect(() => {
    dispatch(getProductMethod(authObject));
  }, [dispatch]);

  useEffect(() => {
    setProductsState(products);
  }, [products]);

  const filteredProducts = productsState.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  filteredProducts.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const addNewProduct = () => {
    dispatch(addProductMethod(data));
    setData({
      user_id: userData.login.id,
      role: userData.login.role,
    });
  };

  const handleChange = (key, value) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  const handleEditProduct = item => {
    console.log('hello', item);
    setIsForUpdate(true);
    setData(old => {
      return {
        ...old,
        ...item,
      };
    });
    setIsModalVisible(true);
  };

  const handleSaveEdit = () => {
    console.log('editingProduct', data);
    if (data.name === '' || data.quantity === '') {
      return;
    }

    dispatch(addProductMethod(null, true, data));

    const updatedProducts = productsState.map(product =>
      product.id === data.id ? data : product,
    );

    setProductsState(updatedProducts);
  };

  useEffect(() => {
    if (product) {
      console.log('Addes product', product);
      setProductsState([...productsState, product]);
      setIsModalVisible(false);
    }
    // if (product && data) {
    //   const updatedProducts = productsState.map(product =>
    //     product.id === data.id ? data : product,
    //   );
    //   setProductsState(updatedProducts);
    //   setIsModalVisible(false);
    // }
  }, [product]);

  const hideModal = () => {
    setUnitModal(false);
  };

  const unitModalComponent = () => {
    return (
      <Portal>
        <Modal
          visible={unitModal}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={unitsArray}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.productItem}
                  onPress={() => {
                    handleChange('unit', item.unit);
                    hideModal();
                  }}>
                  <List.Item
                    title={item.unit}
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
    );
  };

  const showData = () => {
    if (productLoading) {
      return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
    }
    if (productSuccess) {
      return (
        <FlatList
          data={filteredProducts}
          // keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.productItem}>
              <List.Item
                title={item.name}
                description={
                  `Quantity: ${item.quantity} ${item.unit}` +
                  `\nMRP: ${item.mrp}`
                }
                left={props => (
                  <List.Icon
                    {...props}
                    color="#6499F3"
                    icon={require('../res/images/cube.png')}
                  />
                )}
              />
              <View style={styles.buttonContainer}>
                {editOrderRight && (
                  <Button
                    mode="contained"
                    onPress={() => {
                      handleEditProduct(item);
                    }}
                    style={styles.editButton}>
                    Edit
                  </Button>
                )}
                {deleteOrderRight && (
                  <Button
                    mode="outlined"
                    onPress={() => console.log(`Cancel ${item.name}`)}
                    style={styles.cancelButton}>
                    Cancel
                  </Button>
                )}
              </View>
              <Divider />
            </TouchableOpacity>
          )}
        />
      );
    }
    if (productHasErrors) {
      return <Text style={styles.errorMessage}>{errorMessage}</Text>;
    }
  };

  const showProductAddStatus = () => {
    if (loading) {
      return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
    }
    if (hasErrors) {
      return <Text style={styles.errorMessage}>Something went wrong!</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        icon={require('../res/images/search.png')}
        placeholder="Search products"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {showData()}

      {createOrderRight && (
        <FAB
          style={styles.fab}
          icon={require('../res/images/plus.png')}
          onPress={() => {
            toggleModal();
          }}
        />
      )}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={toggleModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isForUpdate ? 'Edit Product' : 'Add New Product'}
            </Text>
            <TextInput
              label="Product Name"
              value={data.name}
              onChangeText={text => {
                handleChange('name', text);
              }}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
              error={!isForUpdate && data.name === ''}
            />
            <TextInput
              label="Quantity"
              value={data.quantity ? data.quantity.toString() : ''}
              onChangeText={text => {
                handleChange('quantity', text);
              }}
              keyboardType="numeric"
              style={styles.input}
              theme={{
                roundness: 10,
              }}
              error={!isForUpdate && !/^\d+$/.test(data.quantity)}
            />

            <TextInput
              label="Unit"
              onFocus={() => {
                setUnitModal(true);
              }}
              value={data.unit}
              onChangeText={text => {
                handleChange('unit', text);
              }}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
              error={!isForUpdate && !/^\d+$/.test(data.unit)}
            />

            {unitModal && unitModalComponent()}

            <TextInput
              label="Product MRP"
              value={data.mrp}
              onChangeText={text => {
                handleChange('mrp', text);
              }}
              keyboardType="numeric"
              style={styles.input}
              theme={{
                roundness: 10,
              }}
              error={!isForUpdate && !/^\d+$/.test(data.mrp)}
            />
            {createOrderRight && (
              <Button
                mode="contained"
                onPress={isForUpdate ? handleSaveEdit : addNewProduct}
                style={styles.addButton}
                disabled={loading}>
                {loading
                  ? 'Adding...'
                  : isForUpdate
                  ? 'Save Edit'
                  : 'Add Product'}
              </Button>
            )}
            {showProductAddStatus()}
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  searchBar: {
    margin: 16,
  },
  productItem: {
    marginHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#007bff',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007bff',
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
  input: {
    marginBottom: 10,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
  },
  successMessage: {
    color: 'green',
    textAlign: 'center',
    marginTop: 10,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Products;

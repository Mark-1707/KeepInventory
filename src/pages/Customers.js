import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {
  Searchbar,
  FAB,
  List,
  Divider,
  Button,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
  MD2Colors,
} from 'react-native-paper';

import {useDispatch, useSelector} from 'react-redux';
import {ACCESS_FUN} from '../../utils/getRights';

import {
  addCustomerMethod,
  addCustomerSelector,
} from '../slices/customers/addcustomer';

import {
  customersSelector,
  getCustomerMethod,
} from '../slices/customers/getcutomers';

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  const dispatch = useDispatch();
  const {customer, loading, hasErrors, message} =
    useSelector(addCustomerSelector);

  const {allcustomers, customersLoading, customersHasErrors} =
    useSelector(customersSelector);

  const userData = useSelector(state => state.login);

  const [data, setData] = useState({
    user_id: userData.login.id,
    role: userData.login.role,
  });

  useEffect(() => {
    dispatch(getCustomerMethod());
  }, [dispatch]);

  useEffect(() => {
    setCustomers(allcustomers);
  }, [allcustomers]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newCustomer, setNewCustomer] = useState({
    name: '',
  });

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [createCustomerRights, setCreateCustomerRights] = useState(false);
  const [editCustomerRights, setEditCustomerRights] = useState(false);
  const [deleteCustomerRights, setDeleteCustomerRights] = useState(false);

  useEffect(() => {
    async function getRights() {
      let result = await ACCESS_FUN(data.user_id);
      setCreateCustomerRights(result['can_add_customers']);
      setEditCustomerRights(result['can_edit_customers']);
      setDeleteCustomerRights(result['can_remove_customers']);
    }

    getRights();
  }, []);

  const onChangeSearch = query => setSearchQuery(query);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    setEditingCustomer(null);
  };

  const addNewCustomer = () => {
    dispatch(addCustomerMethod(newCustomer));
  };

  const handleEditCustomer = customer => {
    setEditingCustomer(customer);

    setIsModalVisible(true);
  };

  const handleSaveEdit = () => {
    dispatch(addCustomerMethod(null, true, editingCustomer));
    let updatedCustomers = customers.map(customer =>
      customer.id === editingCustomer.id ? editingCustomer : customer,
    );
    setCustomers(updatedCustomers);
  };

  useEffect(() => {
    if (customer) {
      setCustomers([...customers, customer]);

      setIsModalVisible(false);
      setNewCustomer({name: ''});
    }
    if (editingCustomer && customer) {
      const updatedCustomers = customers.map(customer =>
        customer.id === editingCustomer.id ? customer : customer,
      );
      setCustomers(updatedCustomers);
      setIsModalVisible(false);
      setEditingCustomer(null);
    }
  }, [customer]);

  const alertFun = item => {
    Alert.alert(
      'Choose an action?',
      'You can make a call or navigate to the customer address',
      [
        {
          text: 'Make a Call',
          onPress: () => {
            // Add code here to make a call
            Linking.openURL(`tel:${item.mobile_number}`);
          },
        },
        {
          text: 'Navigate with Google Maps',
          onPress: () => {
            // Add code here to open Google Maps or perform navigation
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              item.address,
            )}`;

            Linking.openURL(mapUrl);
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
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  filteredCustomers.sort((a, b) => {
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

  const showLoadedData = () => {
    if (customersLoading) {
      return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
    }
    if (customersHasErrors) {
      return <Text style={styles.errorMessage}>Something went wrong</Text>;
    }
    if (customers.length === 0) {
      return <Text>No customers found</Text>;
    }
    return (
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            onLongPress={() => {
              alertFun(item);
            }}
            style={styles.customerItem}
            onPress={() => handleEditCustomer(item)}>
            <List.Item
              title={item.name}
              description={item.mobile_number}
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
    );
  };

  const showAddCustomerModal = () => {
    if (loading) {
      return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
    }
    if (hasErrors) {
      return <Text style={styles.errorMessage}>Something went wrong</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        icon={require('../res/images/search.png')}
        placeholder="Search customers"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {showLoadedData()}

      {createCustomerRights && (
        <FAB
          style={styles.fab}
          icon={require('../res/images/plus.png')}
          onPress={() => toggleModal()}
        />
      )}

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={toggleModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </Text>
            <TextInput
              label="Name"
              value={editingCustomer ? editingCustomer.name : newCustomer.name}
              onChangeText={text => {
                if (editingCustomer) {
                  setEditingCustomer({...editingCustomer, name: text});
                } else {
                  setNewCustomer({...newCustomer, name: text});
                }
              }}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
            />

            <TextInput
              keyboardType="numeric"
              label="Mobile Number"
              value={
                editingCustomer
                  ? editingCustomer.mobile_number
                  : newCustomer.mobile_number
              }
              onChangeText={text => {
                if (editingCustomer) {
                  setEditingCustomer({...editingCustomer, mobile_number: text});
                } else {
                  setNewCustomer({...newCustomer, mobile_number: text});
                }
              }}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
            />

            <TextInput
              label="Address"
              value={
                editingCustomer ? editingCustomer.address : newCustomer.address
              }
              onChangeText={text => {
                if (editingCustomer) {
                  setEditingCustomer({...editingCustomer, address: text});
                } else {
                  setNewCustomer({...newCustomer, address: text});
                }
              }}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
            />

            <TextInput
              label="GST Number"
              value={
                editingCustomer
                  ? editingCustomer.gst_number
                  : newCustomer.gst_number
              }
              onChangeText={text => {
                if (editingCustomer) {
                  setEditingCustomer({...editingCustomer, gst_number: text});
                } else {
                  setNewCustomer({...newCustomer, gst_number: text});
                }
              }}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
            />
            {!editingCustomer && createCustomerRights && (
              <Button
                mode="contained"
                onPress={editingCustomer ? handleSaveEdit : addNewCustomer}
                style={styles.addButton}>
                Add Customer
              </Button>
            )}
            {editingCustomer && editCustomerRights && (
              <Button
                mode="contained"
                onPress={editingCustomer ? handleSaveEdit : addNewCustomer}
                style={styles.addButton}>
                Save Edit
              </Button>
            )}
            {showAddCustomerModal()}
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
  customerItem: {
    marginHorizontal: 16,
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
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Customers;

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
  ActivityIndicator,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';

import {
  addSalesmanSelector,
  addSalesmanMethod,
} from '../slices/salesmen/addsalesman';

import {
  salesmenSelector,
  getSalesmenMethod,
} from '../slices/salesmen/getsalesmen';

const Salesman = () => {
  const userData = useSelector(state => state.login);

  const dispatch = useDispatch();
  const {salesman, loading, hasErrors, success, message} =
    useSelector(addSalesmanSelector);

  const {salesmen, salesmenLoading, salesmenHasErrors, salesmenSuccess} =
    useSelector(salesmenSelector);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [salesmenState, setSalesmenState] = useState([]);

  useEffect(() => {
    let body = {
      user_id: userData.login.id,
      role: userData.login.role,
    };
    dispatch(getSalesmenMethod({body: body}));
  }, [dispatch]);

  useEffect(() => {
    setSalesmenState(salesmen);
  }, [salesmen]);

  const [newSalesman, setNewSalesman] = useState({
    username: '',
    password: '',
    role: userData.login.role,
    userId: userData.login.id,
  });

  const [editingSalesman, setEditingSalesman] = useState(null);

  const onChangeSearch = query => setSearchQuery(query);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    setEditingSalesman(null);
    setNewSalesman({
      username: '',
      password: '',
      role: userData.login.role,
      userId: userData.login.id,
    });
  };

  const addNewSalesman = () => {
    // Simulating an API call

    if (!newSalesman.username.trim() || !newSalesman.password.trim()) {
      return;
    }

    dispatch(addSalesmanMethod(newSalesman));
  };
  const handleEditSalesman = salesman => {
    setEditingSalesman(salesman);
    setIsModalVisible(true);
  };

  const handleSaveEdit = () => {
    dispatch(addSalesmanMethod(editingSalesman, true, editingSalesman));

    const updatedSalesmen = salesmen.map(salesman =>
      salesman.id === editingSalesman.id ? editingSalesman : salesman,
    );
    setSalesmenState(updatedSalesmen);
  };

  useEffect(() => {
    console.log('salesman', salesman);
    if (salesman) {
      setSalesmenState([...salesmenState, salesman]);

      setIsModalVisible(false);
      setNewSalesman({
        username: '',
        password: '',
        role: userData.login.role,
        userId: userData.login.id,
      });
    }

    if (editingSalesman && salesman) {
      const updatedSalesmen = salesmenState.map(s =>
        s.id === editingSalesman.id ? s : s,
      );
      setSalesmenState(updatedSalesmen);
      setIsModalVisible(false);
      setEditingSalesman(null);
    }
  }, [salesman]);

  const renderStates = () => {
    if (loading) {
      return <ActivityIndicator animating={true} style={styles.loading} />;
    }
    if (hasErrors) {
      return (
        <Text style={styles.errorText}>
          Cannot add salesman. Please try again later.
        </Text>
      );
    }
  };

  const loadData = () => {
    if (salesmenLoading) {
      return <ActivityIndicator animating={true} style={styles.loading} />;
    }

    if (salesmenHasErrors) {
      return <Text style={styles.errorText}>Something Went wrong</Text>;
    }

    const filteredSalesmen = salesmenState.filter(salesman =>
      salesman.username.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filteredSalesmen.sort((a, b) => {
      const nameA = a.username.toLowerCase();
      const nameB = b.username.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return (
      <FlatList
        data={filteredSalesmen}
        // keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({item}) => (
          <View style={styles.salesmanItem}>
            <List.Item
              title={item.username}
              left={props => (
                <List.Icon
                  {...props}
                  icon={require('../res/images/user.png')}
                />
              )}
            />
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => handleEditSalesman(item)}
                style={styles.editButton}>
                Edit
              </Button>
              <Button
                mode="outlined"
                onPress={() =>
                  console.log(`Manage Access Rights: ${item.username}`)
                }
                style={styles.manageButton}>
                Manage Access
              </Button>
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        icon={require('../res/images/search.png')}
        placeholder="Search salesmen"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      {loadData()}
      <FAB
        style={styles.fab}
        icon={require('../res/images/plus.png')}
        onPress={() => toggleModal()}
      />
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={toggleModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSalesman ? 'Edit Salesman' : 'Add New Salesman'}
            </Text>
            <TextInput
              label="Name"
              value={
                editingSalesman
                  ? editingSalesman.username
                  : newSalesman.username
              }
              onChangeText={text => {
                if (editingSalesman) {
                  setEditingSalesman({...editingSalesman, username: text});
                } else {
                  setNewSalesman({...newSalesman, username: text});
                }
              }}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
              error={!editingSalesman && newSalesman.username === ''}
            />

            {!editingSalesman && (
              <TextInput
                label="Password"
                value={
                  editingSalesman
                    ? editingSalesman.password
                    : newSalesman.password
                }
                onChangeText={text => {
                  if (editingSalesman) {
                    setEditingSalesman({...editingSalesman, password: text});
                  } else {
                    setNewSalesman({...newSalesman, password: text});
                  }
                }}
                secureTextEntry
                style={styles.input}
                theme={{
                  roundness: 10,
                }}
                error={!editingSalesman && newSalesman.password === ''}
              />
            )}

            <>
              <Button
                mode="contained"
                onPress={editingSalesman ? handleSaveEdit : addNewSalesman}
                style={styles.addButton}
                disabled={loading}>
                {editingSalesman ? 'Save Edit' : 'Add Salesman'}
              </Button>
              {renderStates()}
              {/* {success && (
                  <Text style={styles.successMessage}>
                    Operation successful!
                  </Text>
                )}
                {hasErrors && (
                  <Text style={styles.errorMessage}>
                    Operation failed. Please try again.
                  </Text>
                )}
                {!newSalesman.username.trim() && (
                  <Text style={styles.errorText}>Name is required</Text>
                )}
                {!newSalesman.password.trim() && (
                  <Text style={styles.errorText}>Password is required</Text>
                )}
                {message && <Text style={styles.errorText}>{message}</Text>} */}
            </>
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
  salesmanItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#007bff',
  },
  manageButton: {
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
  loadingIndicator: {
    marginTop: 10,
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default Salesman;

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
import {
  addUnitMethod,
  addUnitSelector,
  getUnitsMethod,
  updateUnitMethod,
} from '../slices/units/addunits';

export default function Units() {
  const dispatch = useDispatch();
  const {unit, loading, hasErrors, unitsArray} = useSelector(addUnitSelector);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isForUpdate, setIsForUpdate] = useState(false);
  const [unitList, setUnitList] = useState([]);
  const [updateIndex, setUpdateIndex] = useState(null);

  const [data, setData] = useState(false);

  const handleChange = (key, value) => {
    setData({...data, [key]: value});
  };

  const onChangeSearch = query => setSearchQuery(query);

  const toggleModal = () => {
    if (isModalVisible) {
      setIsForUpdate(false);
      setData({});
    }
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    dispatch(getUnitsMethod());
  }, []);

  const handleEditUnit = (item, index) => {
    setIsForUpdate(true);
    setUpdateIndex(index);
    toggleModal();
    setData(item);
  };

  const saveEditUnit = () => {
    dispatch(updateUnitMethod(data));

    const updatedUnitList = [...unitList];
    updatedUnitList[updateIndex] = data;
    setUnitList(updatedUnitList);
  };

  const handleAddUnit = () => {
    dispatch(addUnitMethod(data));
  };

  useEffect(() => {
    if (unit && !isForUpdate) {
      toggleModal();
      setUnitList([...unitList, unit]);
    }
    if (unit && isForUpdate) {
      toggleModal();
    }
  }, [unit]);

  useEffect(() => {
    if (unitsArray) {
      setUnitList(unitsArray);
    }
  }, [unitsArray]);

  const renderData = () => {
    if (loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={MD2Colors.red_500} />
        </View>
      );
    }

    if (hasErrors) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.errorMessage}>Something went wrong...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={unitList}
        keyExtractor={item => item.id.toString()}
        renderItem={({item, index}) => (
          <TouchableOpacity
            onLongPress={() => {
              // alertFun(item);
            }}
            style={styles.customerItem}
            onPress={() => handleEditUnit(item, index)}>
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
    );
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

      {renderData()}

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
              {isForUpdate ? 'Edit Unit' : 'Add New Unit'}
            </Text>
            <TextInput
              label="Unit"
              value={data.unit}
              onChangeText={text => handleChange('unit', text)}
              style={styles.input}
              theme={{
                roundness: 10,
              }}
            />

            <Button
              mode="contained"
              onPress={() => {
                isForUpdate ? saveEditUnit() : handleAddUnit();
              }}
              style={styles.addButton}>
              {isForUpdate ? 'Save Edit' : 'Add Unit'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

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

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  Appbar,
  FAB,
  Portal,
  Modal,
  Button,
  List,
  Divider,
  Avatar,
  Searchbar,
} from 'react-native-paper';
import {Alert} from 'react-native';
import {DatePickerModal} from 'react-native-paper-dates';
import {useDispatch, useSelector} from 'react-redux';
import {getOrdersMethod, getOrdersSelector} from '../slices/orders/getorders';
import {
  getSalesmenMethod,
  salesmenSelector,
} from '../slices/salesmen/getsalesmen';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import {ACCESS_FUN} from '../../utils/getRights';
import {useFocusEffect} from '@react-navigation/native';

const Orders = ({navigation}) => {
  const userData = useSelector(state => state.login);
  const dispatch = useDispatch();
  const {orders, getOrdersloading, getOrdershasErrors} =
    useSelector(getOrdersSelector);

  const {salesmen, getSalesmenloading, getSalesmenhasErrors} =
    useSelector(salesmenSelector);

  const [range, setRange] = React.useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesmanVisible, setSalesmanVisible] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  const showSalesmanModal = () => setSalesmanVisible(true);
  const hideSalesmanModal = () => setSalesmanVisible(false);

  const onConfirm = React.useCallback(
    ({startDate, endDate}) => {
      setShowModal(false);
      setRange({startDate, endDate});
    },
    [setShowModal, setRange],
  );

  const [data, setData] = useState({
    user_id: userData.login.id,
    role: userData.login.role,
  });

  const [createOrdersRights, setCreateeOrdersRights] = useState(false);

  useEffect(() => {
    async function getRights() {
      let result = await ACCESS_FUN(data.user_id);
      setCreateeOrdersRights(result['can_add_orders']);
    }

    getRights();
  }, []);

  // const [ordersData, setOrderData] = useState([]);

  useEffect(() => {
    dispatch(getOrdersMethod());
  }, [dispatch]);

  useEffect(() => {
    let body = {
      user_id: userData.login.id,
      role: userData.login.role,
    };
    dispatch(getSalesmenMethod({body: body}));
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      let body = {
        user_id: userData.login.id,
        role: userData.login.role,
      };
      dispatch(getSalesmenMethod({body: body}));
    }, []),
  );

  // useEffect(() => {}, [orders]);

  let filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.timezone).toLocaleDateString();
    return (
      orderDate >= range.startDate.toLocaleDateString() &&
      orderDate <= range.endDate.toLocaleDateString()
    );
  });

  const onChangeSearch = query => {
    setSearchQuery(query);
  };

  filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.timezone).toLocaleDateString();
    console.log(orderDate, '  ', range.endDate.toLocaleDateString());
    console.log(
      orderDate >= range.startDate.toLocaleDateString() &&
        orderDate <= range.endDate.toLocaleDateString() &&
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return (
      orderDate >= range.startDate.toLocaleDateString() &&
      orderDate <= range.endDate.toLocaleDateString() &&
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  filteredOrders.sort((a, b) => {
    const nameA = a.customer_name.toLowerCase();
    const nameB = b.customer_name.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

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

  const printAll = async () => {
    try {
      let html = ''; // Initialize an empty HTML string
      for (let i = 0; i < filteredOrders.length; i++) {
        const order = filteredOrders[i];
        console.log(order);
        const orderHtml = `
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
                  <td>${order.customer_name}
                  </td>
                  ${
                    order.gst_number !== null &&
                    order.gst_number !== undefined &&
                    order.gst_number !== ''
                      ? `
          <th>GST Number</th>
          <td>${order.gst_number}</td>`
                      : ''
                  }
                </tr>
                <tr>
                  <th>Order Date</th>
                  <td>${formatDate(new Date(order.timezone))}</td>
                  <th></th><td></td>
                </tr>
              </table>
              <table>
                <tr>
                  <th class="id">Product ID</th>
                  <th>Product Name</th>
                  <th>Product Qty</th>
                </tr>
                ${order.products
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

        html += orderHtml;
      }
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth() + 1; // Months are zero-based, so add 1
      const year = selectedDate.getFullYear();
      const fullDate = `${day}-${month}-${year}`;
      const options = {
        html,
        fileName: `invoice`,
        directory: `Invoices`,
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
    } catch (e) {
      Alert.alert('Error', e);
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
      <ScrollView>
        <List.Section>
          <List.Subheader>
            Orders for {range.startDate.toDateString()} to{' '}
            {range.endDate.toDateString()}
          </List.Subheader>

          {filteredOrders.map(order => (
            <View
              key={order.order_id}
              style={[
                styles.orderItem,
                order.status && styles.makredOrderItem,
              ]}>
              <Divider />
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('OpenOrder', {
                    order_id: order.order_id,
                  });
                }}>
                {selectedSalesman === '' ? (
                  <List.Item
                    title={order.customer_name}
                    description={order.mobile_number}
                    left={() => (
                      <List.Icon icon={require('../res/images/receipt.png')} />
                    )}
                  />
                ) : (
                  order.salesman_username === selectedSalesman && (
                    <List.Item
                      title={order.customer_name}
                      description={order.mobile_number}
                      left={() => (
                        <List.Icon
                          icon={require('../res/images/receipt.png')}
                        />
                      )}
                    />
                  )
                )}
              </TouchableOpacity>
            </View>
          ))}
        </List.Section>
      </ScrollView>
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={toggleModal}
          contentContainerStyle={styles.modalContainer}
          onBackdropPress={toggleModal} // Add this line
        >
          <Text style={styles.modalTitle}>Filter Orders</Text>
          <Divider style={styles.divider} />

          <DatePickerModal
            mode="range"
            visible={showModal}
            onDismiss={toggleModal}
            startDate={range.startDate}
            endDate={range.endDate}
            onConfirm={onConfirm}
          />

          <Button onPress={toggleModal}>Apply Filter</Button>
        </Modal>
      </Portal>
      {createOrdersRights && (
        <FAB
          style={styles.fab}
          icon={require('../res/images/plus.png')}
          onPress={() =>
            /* Navigate to the CreateOrder page */
            navigation.navigate('CreateOrder')
          }
        />
      )}
      <TouchableOpacity style={[styles.fab, {right: 70}]} onPress={toggleModal}>
        <Image
          style={{width: 60, height: 60}}
          source={require('../res/images/calendar.png')}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, {right: 140, bottom: 5}]}
        onPress={showSalesmanModal}>
        <Image
          style={{width: 55, height: 55}}
          source={require('../res/images/salesman.png')}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, {right: 220, bottom: 5}]}
        onPress={printAll}>
        <Image
          style={{width: 50, height: 50}}
          source={require('../res/images/print.png')}
        />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={salesmanVisible}
          onDismiss={hideSalesmanModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Searchbar
              icon={require('../res/images/search.png')}
              placeholder="Search customers"
              // onChangeText={onChangeCustomerSearch}
              // value={customerSearchQuery}
              style={styles.searchBar}
            />

            <TouchableOpacity
              style={styles.customerItem}
              onPress={() => {
                setSelectedSalesman('');
                hideSalesmanModal();
              }}>
              <List.Item
                title="All"
                left={props => (
                  <List.Icon
                    {...props}
                    icon={require('../res/images/user.png')}
                  />
                )}
              />
              <Divider />
            </TouchableOpacity>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={salesmen.filter(
                salesman => salesman.username.toLowerCase(),
                // .includes(customerSearchQuery.toLowerCase()),
              )}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => {
                    setSelectedSalesman(item.username);
                    hideSalesmanModal();
                  }}>
                  <List.Item
                    title={item.username}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 5,
  },
  orderItem: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingLeft: 8,
  },
  makredOrderItem: {
    backgroundColor: '#00FF0080',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default Orders;

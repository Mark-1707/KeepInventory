import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';
import {useSelector} from 'react-redux';
import {Card, Title, Paragraph} from 'react-native-paper';
import cache from '../../utils/cache';
import {useDispatch} from 'react-redux';
import {resetMethod} from '../slices/login';

const Dashboard = ({navigation}) => {
  //   const isAdmin = useSelector(state => state.user.isAdmin); // Replace with your actual state management
  const dispatch = useDispatch();
  const userRole = useSelector(state => state.login.login.role);
  const currentDate = new Date().toDateString();

  console.log(userRole);

  const dashboardOptions = [
    {
      title: 'Orders',
      onPress: () => {
        navigation.navigate('Orders');
      },
    },
    {
      title: 'Products',
      onPress: () => {
        navigation.navigate('Products');
      },
    },
    {
      title: 'Customers',
      onPress: () => {
        navigation.navigate('Customers');
      },
    },

    {
      title: 'Logout',
      onPress: async () => {
        try {
          await cache.remove('user_role');
          await cache.remove('user_id');
          await cache.remove('login_status');
          const a = await cache.get('login_status');
          console.log('Hello', a);
        } catch (e) {
          console.log(e);
        }

        dispatch(resetMethod());
        // Exit app
        navigation.navigate('Login');
      },
    },
  ];

  if (userRole === 'admin') {
    dashboardOptions.splice(3, 0, {
      title: 'Salesmen',
      onPress: () => {
        navigation.navigate('Salesmen');
      },
    });

    dashboardOptions.splice(4, 0, {
      title: 'Units',
      onPress: () => {
        navigation.navigate('Units');
      },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.currentDate}>{currentDate}</Text>

      <View style={styles.optionContainer}>
        {dashboardOptions.map(option => (
          <Card
            key={option.title}
            style={styles.optionCard}
            onPress={option.onPress}>
            <Card.Content>
              <Title style={styles.optionTitle}>{option.title}</Title>
              <Paragraph style={styles.optionSubtitle}>Tap to view</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  currentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    color: 'black',
  },
  optionContainer: {
    padding: 16,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionSubtitle: {
    marginTop: 4,
    color: 'rgba(0, 0, 0, 0.6)',
  },
});

export default Dashboard;

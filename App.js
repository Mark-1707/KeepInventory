import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import Orders from './src/pages/Orders';
import Products from './src/pages/Products';
import Salesman from './src/pages/Salesmen';
import Customers from './src/pages/Customers';
import CreateOrder from './src/components/CreateOrder';
import OpenOrder from './src/pages/OpenOrder';
import Units from './src/pages/Units';

import {Provider as PaperProvider, DefaultTheme} from 'react-native-paper';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      {/* Use DarkTheme for dark mode */}
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Orders" component={Orders} />
          <Stack.Screen name="Products" component={Products} />
          <Stack.Screen name="Salesmen" component={Salesman} />
          <Stack.Screen name="Customers" component={Customers} />
          <Stack.Screen name="CreateOrder" component={CreateOrder} />
          <Stack.Screen name="OpenOrder" component={OpenOrder} />
          <Stack.Screen name="Units" component={Units} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

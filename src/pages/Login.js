import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {TextInput, Button, Text, useTheme} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {loginSelector, loginMethod, saveFromCache} from '../slices/login';
import cache from '../../utils/cache';
import {BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

const Login = ({navigation}) => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const {success, loading, hasErrors} = useSelector(loginSelector);

  const [usernameError, setUsernameError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      // Your code here
      setFormData({
        username: '',
        password: '',
      });

      // You can perform any screen-specific actions here
      // For example, data fetching, refreshing, etc.

      return () => {
        // Optional cleanup function
        console.log('Screen is unfocused');
        // You can perform cleanup or unsubscribe from any event listeners here
      };
    }, []),
  );

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Validate username
    if (field === 'username') {
      if (value.includes(' ')) {
        setUsernameError('Username should not contain spaces');
      } else if (!/^[a-z]+$/.test(value)) {
        setUsernameError('Username should contain only lowercase letters');
      } else {
        setUsernameError('');
      }
    }
  };

  const handleLogin = () => {
    if (!usernameError) {
      dispatch(loginMethod(formData));
    }
  };

  const getButtonColor = () => {
    return loading || !!usernameError ? colors.error : colors.primary;
  };

  const validateLogin = () => {
    if (hasErrors) {
      return (
        <Text style={styles.errorText}>Invalid username or password!</Text>
      );
    }
    console.log(success);
    if (success) {
      navigation.navigate('Dashboard');
    }
  };

  useEffect(() => {
    async function getCache() {
      const role = await cache.get('user_role');
      const status = await cache.get('login_status');
      const id = await cache.get('user_id');
      // console.log("role", role, status, id)
      if (status) {
        dispatch(saveFromCache());
        navigation.navigate('Dashboard');
      }
    }

    getCache();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={[styles.input, {backgroundColor: colors.surface}]}
        label="Username"
        value={formData.username}
        onChangeText={text => handleInputChange('username', text)}
        error={!!usernameError}
      />
      {usernameError ? (
        <Text style={styles.errorText}>{usernameError}</Text>
      ) : null}
      <TextInput
        style={[styles.input, {backgroundColor: colors.surface}]}
        label="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={text => handleInputChange('password', text)}
      />
      <Button
        style={[styles.loginButton, {backgroundColor: getButtonColor()}]}
        mode="contained"
        onPress={handleLogin}
        disabled={loading || !!usernameError}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      {validateLogin()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loginButton: {
    padding: 10,
    borderRadius: 5,
    width: '80%',
    marginTop: 10,
  },
});

export default Login;

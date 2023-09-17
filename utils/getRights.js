import url from './url';

export async function ACCESS_FUN(user_id) {
  let value = false;
  try {
    let response = await fetch(`${url}/getaccessrights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_id}),
    });

    let res = await response.json();
    value = res.data;
  } catch (error) {
    console.log(error);
  }
  return value;
}

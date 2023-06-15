import Reflux from 'reflux';

// TODO: Set your Backend URL here!
const BASE_URL = 'http://localhost:3000';

const apiActions = Reflux.createActions({
  getCategories: { asyncResult: true },
  getMerchants: { asyncResult: true },
});

apiActions.getCategories.listen(() => {
  const reqUrl = `${BASE_URL}/categories`;

  fetch(reqUrl)
    .then(data => data.json())
    .then(data => {
      apiActions.getCategories.completed({
        data: data,
      });
      console.log('apiActions.getCategories - success!');
    })
    .catch(error => {
      console.log('apiActions.getCategories - error! ', error);
      apiActions.getCategories.completed({
        data: error,
        loadFail: true,
      });
    })
});

apiActions.getMerchants.listen(() => {
  const reqUrl = `${BASE_URL}/merchants`;

  fetch(reqUrl)
    .then(data => data.json())
    .then(data => {
      apiActions.getMerchants.completed({
        data: data,
      });
      console.log('apiActions.getMerchants - success!');
    })
    .catch(error => {
      console.log('apiActions.getMerchants - error! ', error);
      apiActions.getMerchants.completed({
        data: error,
        loadFail: true,
      });
    })
});

export default apiActions;

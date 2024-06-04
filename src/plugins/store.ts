import Vuex from 'vuex'

const store = new Vuex.Store({
  state: {
    token: null,
    auth: false,
    user: {}
  },
  getters: {
    user: (state) => state.user,
    auth: (state) => state.auth,
    token: (state) => state.token
  },
  mutations: {
    SET_TOKEN(state, value) {
      state.token = value
    },
    SET_AUTH(state, value) {
      state.auth = value
    },
    SET_USER(state, value) {
      state.user = value
    }
  },
  actions: {
    resetUser({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', {})
      commit('SET_AUTH', false)
    }
  }
})
export default store

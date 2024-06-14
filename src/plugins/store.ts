import Vuex from 'vuex'

const store = new Vuex.Store({
  state: {
    token: null,
    auth: false,
    user: {}
  },
  getters: {
    user: (state: { user: any }) => state.user,
    auth: (state: { auth: any }) => state.auth,
    token: (state: { token: any }) => state.token
  },
  mutations: {
    SET_TOKEN(state: { token: any }, value: any) {
      state.token = value
    },
    SET_AUTH(state: { auth: any }, value: any) {
      state.auth = value
    },
    SET_USER(state: { user: any }, value: any) {
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

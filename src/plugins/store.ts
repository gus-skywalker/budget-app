// store/index.ts
import { createStore } from 'vuex'

import axios from 'axios'
// Define the User type
interface User {
  name: string
  email: string
  avatar: string
}

// Define the State type
interface State {
  user: User | null
}

// Define the mutations types
type Mutations<S = State> = {
  SET_USER(state: S, user: User): void
  CLEAR_USER(state: S): void
}

// Define the actions context
interface ActionsContext {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>
}

// Define the actions types
type Actions = {
  login(context: ActionsContext, payload: { email: string; password: string }): Promise<void>
  logout(context: ActionsContext): void
}

// Define the getters types
type Getters = {
  user(state: State): User | null
}

// Create the store
export const store = createStore<State>({
  state: {
    user: null
  },
  mutations: {
    SET_USER(state, user: User) {
      state.user = user
    },
    CLEAR_USER(state) {
      state.user = null
    }
  } as Mutations,
  actions: {
    async login({ commit }, { email, password }) {
      try {
        const response = await axios.post('/api/login', { email, password })
        commit('SET_USER', response.data.user)
      } catch (error) {
        alert('Invalid credentials')
      }
    },
    logout({ commit }) {
      commit('CLEAR_USER')
    }
  } as Actions,
  getters: {
    user: (state) => state.user
  } as Getters
})

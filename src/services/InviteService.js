import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_URL;

/**
 * Serviço para gerenciamento de convites de usuários para empresas
 */
class InviteService {
  /**
   * Convida um usuário para uma empresa
   * @param {string} companyId - ID da empresa
   * @param {string} email - Email do usuário a ser convidado
   * @param {string} role - Papel do usuário (admin, member, viewer)
   * @returns {Promise} Promise com os dados do convite
   */
  async inviteUser(companyId, email, role = 'member') {
    try {
      const response = await axios.post(
        `${API_URL}/companies/${companyId}/invite`,
        { email, role }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao convidar usuário:', error);
      throw error;
    }
  }

  /**
   * Lista convites pendentes de uma empresa
   * @param {string} companyId - ID da empresa
   * @returns {Promise} Promise com a lista de convites
   */
  async listInvites(companyId) {
    try {
      const response = await axios.get(
        `${API_URL}/companies/${companyId}/invites`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar convites:', error);
      throw error;
    }
  }

  /**
   * Cancela um convite pendente
   * @param {string} companyId - ID da empresa
   * @param {string} inviteId - ID do convite
   * @returns {Promise} Promise com confirmação
   */
  async cancelInvite(companyId, inviteId) {
    try {
      const response = await axios.delete(
        `${API_URL}/companies/${companyId}/invites/${inviteId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      throw error;
    }
  }

  /**
   * Valida um token de convite
   * @param {string} inviteToken - Token do convite
   * @returns {Promise} Promise com os dados do convite
   */
  async validateInvite(inviteToken) {
    try {
      const response = await axios.get(
        `${API_URL}/invites/validate/${inviteToken}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao validar convite:', error);
      throw error;
    }
  }
}

export default new InviteService();

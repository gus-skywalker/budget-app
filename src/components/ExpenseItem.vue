<template>
  <v-list-item>
    <v-row align="center" class="w-100 expense-row">
      <v-col cols="12" md="8" class="expense-info">
        <v-list-item-title>
          {{ expense.description }}
        </v-list-item-title>
        <v-list-item-subtitle>
          R$ {{ expense.amount }} - Data: {{ expense.date }}
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="expense.category">
          Categoria: {{ expense.category.name }}
          <v-icon :icon="categoryIcons[expense.category.code]" class="mr-2"></v-icon>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="expense.users && expense.users.length">
          Compartilhado com:
          <v-chip v-for="user in expense.users" :key="user.userId" class="mr-2">
            {{ user.name }}
          </v-chip>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="hasAlerts">
          <v-chip color="orange" dark class="ma-2">
            Alerta configurado
          </v-chip>
        </v-list-item-subtitle>
      </v-col>
      <v-col cols="auto" class="d-flex align-center action-buttons">
        <v-btn icon size="x-small" density="comfortable" @click="isDialogOpen = true" color="primary" class="expense-action-btn">
          <v-icon size="16">mdi-share-variant</v-icon>
        </v-btn>
        <v-btn icon size="x-small" density="comfortable" color="orange" @click="openAlertDialog" class="expense-action-btn">
          <v-icon size="16">mdi-alarm</v-icon>
        </v-btn>
        <v-btn icon size="x-small" density="comfortable" color="red" @click="$emit('deleteExpense', expense)" class="expense-action-btn">
          <v-icon size="16">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <!-- v-dialog para anexar arquivos -->
    <v-dialog v-model="isDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>Gerenciar Anexos e Compartilhar</v-card-title>
        <v-card-text>
          <v-text-field v-model="email" label="Email" type="email" :rules="emailRules" required></v-text-field>
          <!-- Lista de arquivos já anexados -->
          <v-list dense>
            <v-list-item v-for="file in attachedFiles" :key="file.id">
              <v-list-item-title>
                {{ file.fileName }}
              </v-list-item-title>
              <v-list-item-action>
                <v-btn icon size="x-small" @click="downloadFile(file)">
                  <v-icon size="18">mdi-download</v-icon>
                </v-btn>
                <v-btn icon size="x-small" color="red" @click="removeAttachedFile(file)">
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <!-- Campo para selecionar múltiplos arquivos -->
          <v-file-input ref="fileInput" label="Adicionar novos anexos" accept="image/*,.pdf" multiple
            @change="onNewFilesChange"></v-file-input>
          <!-- Lista de novos arquivos selecionados -->
          <v-list dense>
            <v-list-item v-for="(file, index) in newFiles" :key="index">
              {{ file.name }}
              <v-btn icon size="x-small" @click="removeFile(index)">
                <v-icon size="18">mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card-text>
        <!-- Botões de ação -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- Botão "Anexar" -->
          <v-btn color="green" text @click="attachFiles">Anexar</v-btn>
          <v-btn color="blue darken-1" text @click="isDialogOpen = false">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click="shareExpense" :disabled="!email">Compartilhar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Confirmação de Exclusão -->
    <v-dialog v-model="confirmDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza de que deseja excluir o arquivo "{{ fileToDelete?.fileName }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="confirmDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="red" text @click="confirmDeleteAttachment">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isAlertDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>Configurar Alerta</v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <!-- Lista de alertas configurados -->
          <v-list-subheader>Alertas Configurados</v-list-subheader>
          <v-list dense v-if="expense.alerts && expense.alerts.length">
            <v-list-item v-for="(alert, index) in expense.alerts" :key="index">
              <v-list-item-title>
                <v-chip color="blue" dark>
                  Data do Alerta: {{ formatAlertDate(alert.alertDate) }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip color="green" dark>
                  Status: {{ alert.status }}
                </v-chip>
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                <strong>Métodos:</strong> {{ formatMethods(alert.methods) }}
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                <strong>Recorrência:</strong>
                <span v-if="alert.recurrenceInterval">{{ formatRecurrence(alert.recurrenceInterval) }}</span>
                <span v-else>Não recorrente</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title>Nenhum alerta configurado.</v-list-item-title>
            </v-list-item>
          </v-list>

          <!-- Configuração de novos alertas -->
          <v-divider class="my-4"></v-divider>
          <v-list-subheader>Configurar Novo Alerta</v-list-subheader>
          <v-radio-group v-model="useDefaultAlertDays" row>
            <v-radio :label="`Usar configuração padrão (${defaultAlertDays} dias)`" :value="true">
            </v-radio>
            <v-radio label="Definir um valor personalizado" :value="false">
            </v-radio>
          </v-radio-group>

          <v-text-field v-if="!useDefaultAlertDays" v-model="customAlertDays" type="number" min="1" max="30"
            label="Dias antes do alerta" placeholder="Ex.: 5 dias" :rules="customAlertDaysRules" dense outlined>
            <template v-slot:prepend>
              <v-icon>mdi-calendar</v-icon>
            </template>
          </v-text-field>

          <v-switch v-model="isRecurring" label="Definir como recorrente">
            <template v-slot:prepend>
              <v-icon>mdi-repeat</v-icon>
            </template>
          </v-switch>

          <v-select v-if="isRecurring" v-model="recurrenceInterval" :items="['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']"
            label="Intervalo de Recorrência" placeholder="Selecione a frequência" dense outlined>
            <template v-slot:prepend>
              <v-icon>mdi-timer</v-icon>
            </template>
          </v-select>

          <v-text-field v-if="isRecurring" v-model="recurrenceEndDate" type="date"
            label="Data de Término da Recorrência" dense outlined>
            <template v-slot:prepend>
              <v-icon>mdi-calendar-end</v-icon>
            </template>
          </v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="isAlertDialogOpen = false">Cancelar</v-btn>
          <v-btn color="red" text @click="resetAlertForm">Resetar</v-btn>
          <v-btn color="green" dark text @click="saveAlert">Salvar</v-btn>
        </v-card-actions>
      </v-card>

      <!-- Snackbar de feedback -->
      <v-snackbar v-model="snackbar" color="green" top>
        {{ snackbarMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false">Fechar</v-btn>
        </template>
      </v-snackbar>
    </v-dialog>


  </v-list-item>
</template>


<script>
import NotificationService from '@/services/NotificationService'

export default {
  name: 'ExpenseItem',
  props: {
    expense: Object,
  },
  computed: {
    hasAlerts() {
      return this.expense.alerts && this.expense.alerts.length > 0;
    },
  },
  data() {
    return {
      categoryIcons: {
        groceries: 'mdi-cart',
        utilities: 'mdi-lightbulb',
        transportation: 'mdi-bus',
        entertainment: 'mdi-movie',
        healthcare: 'mdi-heart-pulse',
        education: 'mdi-school',
        dining_out: 'mdi-silverware',
        travel: 'mdi-airplane',
        clothing: 'mdi-tshirt-crew',
        home_maintenance: 'mdi-home',
        gifts: 'mdi-gift',
        charity: 'mdi-hand-heart',
        subscriptions: 'mdi-receipt',
        miscellaneous: 'mdi-dots-horizontal',
      },
      isDialogOpen: false,
      email: '',
      emailRules: [
        v => !!v || 'Email é obrigatório',
        v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
      ],
      attachedFiles: [],
      newFiles: [],
      confirmDeleteDialog: false,
      fileToDelete: null,
      isAlertDialogOpen: false,
      useDefaultAlertDays: true,
      defaultAlertDays: 3,
      customAlertDays: 1,
      isRecurring: false,
      recurrenceInterval: null,
      recurrenceEndDate: null,
      customAlertDaysRules: [
        v => !!v || 'O valor é obrigatório',
        v => v > 0 || 'O valor deve ser maior que zero',
        v => v <= 30 || 'O valor deve ser menor ou igual a 30',
      ],
      snackbar: false,
      snackbarMessage: '',
    };
  },
  mounted() {
    this.attachedFiles = this.expense.attachments || [];
    this.fetchUserSettings();
  },
  watch: {
    isRecurring(newVal) {
      console.log(newVal);
      if (!newVal) {
        // Se a recorrência for desativada, limpe os campos relacionados
        this.recurrenceInterval = null;
        this.recurrenceEndDate = null;
      } else {
        // Defina valores padrão quando a recorrência for ativada
        this.recurrenceInterval = 'MONTHLY'; // Exemplo de valor padrão
        this.recurrenceEndDate = this.recurrenceEndDate || new Date().toISOString().split('T')[0]; // Data atual como padrão
      }
    },
  },
  methods: {
    onNewFilesChange(event) {
      const files = event.target.files;
      if (!files || files.length === 0) {
        console.warn("Nenhum arquivo selecionado.");
        return;
      }

      const filesArray = Array.from(files);

      const uniqueFiles = filesArray.filter(newFile => {
        const isDuplicate = this.attachedFiles.some(existingFile => existingFile.name === newFile.name);
        if (isDuplicate) {
          console.warn(`O arquivo "${newFile.name}" já foi adicionado.`);
        }
        return !isDuplicate;
      });

      this.newFiles = [...this.newFiles, ...uniqueFiles];

      console.log("Arquivos selecionados:", this.newFiles);
    },
    removeFile(index) {
      this.newFiles.splice(index, 1);
    },
    removeAttachedFile(file) {
      // Definir o arquivo a ser excluído e abrir o diálogo de confirmação
      this.fileToDelete = file;
      this.confirmDeleteDialog = true;
    },
    confirmDeleteAttachment() {
      if (this.fileToDelete) {
        // Remover o arquivo da lista local
        this.attachedFiles = this.attachedFiles.filter(
          file => file.id !== this.fileToDelete.id
        );
        // Emitir evento para remover o anexo no backend
        this.$emit('removeAttachment', {
          expenseId: this.expense.id,
          attachmentId: this.fileToDelete.id,
        });
        // Limpar o arquivo selecionado e fechar o diálogo
        this.fileToDelete = null;
        this.confirmDeleteDialog = false;
      }
    },
    downloadFile(file) {
      const byteCharacters = atob(file.fileData);
      const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.fileType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.fileName;
      link.click();
    },
    // Novo método para anexar arquivos
    attachFiles() {
      if (this.newFiles.length === 0) {
        console.warn('Nenhum arquivo novo para anexar.');
        return;
      }

      // Crie um objeto FormData para enviar os arquivos para o backend
      const formData = new FormData();
      formData.append('expenseId', this.expense.id);
      this.newFiles.forEach(file => {
        formData.append('files', file);
      });

      // Faça a chamada à API para salvar os arquivos
      // Supondo que você tenha um serviço chamado 'expenseService' com o método 'attachFiles'
      this.$emit('attachFiles', { expense: this.expense, files: formData });

      // Limpe os novos arquivos após o anexo
      this.newFiles = [];
    },
    shareExpense() {
      if (!this.email) {
        console.warn('Email não informado');
        return;
      }
      const combinedFiles = [...this.attachedFiles, ...this.newFiles];
      this.$emit('shareExpense', { expense: this.expense, email: this.email, files: combinedFiles });
      this.isDialogOpen = false;
    },
    async fetchUserSettings() {
      try {
        const response = await NotificationService.getAlertSettings();
        const settings = response.data || {};

        if (settings.alertDaysBefore) {
          this.defaultAlertDays = settings.alertDaysBefore; // Define o padrão vindo da API
        }
        console.log('Configurações do usuário carregadas:', settings);
      } catch (error) {
        console.error('Erro ao carregar configurações do usuário:', error);
      }
    },
    openAlertDialog() {
      this.isAlertDialogOpen = true;
    },
    formatAlertDate(date) {
      // Formata a data do alerta para um formato legível
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('pt-BR', options);
    },
    formatMethods(methods) {
      // Converte os métodos de entrega para uma string legível
      return methods.join(', ');
    },
    formatRecurrence(recurrenceInterval) {
      // Converte o intervalo de recorrência para uma string legível
      const map = {
        DAILY: 'Diário',
        WEEKLY: 'Semanal',
        MONTHLY: 'Mensal',
        YEARLY: 'Anual',
      };
      return map[recurrenceInterval] || 'Desconhecido';
    },
    saveAlert() {
      const daysBefore = this.useDefaultAlertDays ? this.defaultAlertDays : this.customAlertDays;

      const alertData = {
        expense: this.expense,
        daysBefore: daysBefore,
        isRecurring: this.isRecurring,
        recurrenceInterval: this.isRecurring ? this.recurrenceInterval : null,
        recurrenceEndDate: this.isRecurring ? this.recurrenceEndDate : null,
      };
      // Emita o evento para o backend ou salve localmente
      this.$emit('sendReminder', alertData);

      this.snackbarMessage = 'Alerta configurado com sucesso!';
      this.snackbar = true;
      this.isAlertDialogOpen = false;

      console.log(`Alerta configurado para ${daysBefore} dias antes.`);
      this.isAlertDialogOpen = false;
    },
    resetAlertForm() {
      this.useDefaultAlertDays = true;
      this.customAlertDays = 1;
      this.isRecurring = false;
      this.recurrenceInterval = null;
      this.recurrenceEndDate = null;
    },
  },
};
</script>

<style scoped>
.v-btn {
  /* Remove o padding extra para botões icônicos */
  padding: 4px;
}

.v-icon {
  /* Ajusta o tamanho do ícone */
  line-height: 18px;
}

.expense-row {
  position: relative;
}

.expense-info {
  padding-right: 116px;
}

.action-buttons {
  position: absolute;
  top: 4px;
  right: 0;
  gap: 6px;
}

.expense-action-btn {
  min-width: 32px;
  width: 32px;
  height: 32px;
  padding: 0;
}

.expense-action-btn .v-icon {
  line-height: 32px;
}
</style>

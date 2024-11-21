<template>
  <v-list-item>
    <v-row align="center" class="w-100">
      <v-col cols="9">
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
      </v-col>
      <v-col cols="3" class="d-flex justify-end">
        <v-btn icon size="small" @click="isDialogOpen = true" color="primary" class="mr-2">
          <v-icon size="18">mdi-share-variant</v-icon>
        </v-btn>
        <v-btn icon size="small" color="orange" @click="scheduleAlarm" class="mr-2">
          <v-icon size="18">mdi-alarm</v-icon>
        </v-btn>
        <v-btn icon size="small" color="red" @click="$emit('deleteExpense', expense)" class="mr-2">
          <v-icon size="18">mdi-delete</v-icon>
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
            <v-list-item v-for="(file, index) in attachedFiles" :key="file.id">
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

  </v-list-item>
</template>


<script>
import NotificationService from '@/services/NotificationService'

export default {
  name: 'ExpenseItem',
  props: {
    expense: Object,
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
    };
  },
  mounted() {
    this.attachedFiles = this.expense.attachments || [];
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
    scheduleAlarm() {
      try {
        this.$emit('sendReminder', this.expense);
        console.log(`Alerta agendado para a despesa: ${this.expense.description}`);
      } catch (error) {
        console.error('Erro ao agendar alerta:', error);
      }
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
</style>

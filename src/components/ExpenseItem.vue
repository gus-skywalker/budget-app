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
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="expense.users && expense.users.length">
          Compartilhado com:
          <v-chip v-for="user in expense.users" :key="user.userId" class="mr-2">
            {{ user.name }}
          </v-chip>
        </v-list-item-subtitle>
      </v-col>
      <v-col cols="3" class="d-flex justify-end">
        <v-btn x-small icon height="35px" width="35px" @click="isDialogOpen = true" color="primary" class="mr-2">
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
        <v-btn x-small icon height="35px" width="35px" color="red" @click="$emit('deleteExpense', expense)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <!-- v-dialog para inserir o email do destinatário e anexar recibos -->
    <v-dialog v-model="isDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Informe o email do destinatário e anexe recibos</v-card-title>
        <v-card-text>
          <v-text-field v-model="email" label="Email" type="email" required></v-text-field>
          <!-- Campo para selecionar múltiplos arquivos -->
          <v-file-input v-model="files" label="Selecione os recibos" accept="image/*,.pdf" multiple
            @change="onFilesChange" required>
          </v-file-input>
          <!-- Lista de arquivos selecionados -->
          <v-list dense>
            <v-list-item v-for="(file, index) in files" :key="index">
              {{ file.name }}
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="isDialogOpen = false">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click="shareExpense">Compartilhar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>


<script>
export default {
  name: 'ExpenseItem',
  props: {
    expense: Object
  },
  data() {
    return {
      isDialogOpen: false,
      email: '',
      files: []
    }
  },
  methods: {
    // Combinar novos arquivos com os já existentes
    onFilesChange(newFiles) {
      if (newFiles && newFiles.length > 0) {
        this.files = [...this.files, ...newFiles]; // Adicionando novos arquivos à lista existente
      }
      // if (newFiles && newFiles.length > 0) {
      //   this.files = [...newFiles]; // Substitui os arquivos existentes pelos novos selecionados
      // }
    },
    shareExpense() {
      if (this.email) {
        console.log(`Compartilhando ${this.expense.description} com o email ${this.email}`)
        console.log(this.files);
        this.$emit('shareExpense', { expense: this.expense, email: this.email, files: this.files });
        this.isDialogOpen = false
      } else {
        console.warn('Email não informado')
      }
    },
  }
}
</script>

<style>
.v-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>

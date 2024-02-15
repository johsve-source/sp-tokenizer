<template>
  <div id="app">
    <div class="container">
      <h1>Snälla Pojkar - Token Generator</h1>
      <button @click="generateToken">Generate Token</button>
      <div v-if="generatedToken">
        <p class="token-label">Generated Token:</p>
        <textarea
          class="token-field"
          v-model="generatedToken"
          readonly
        ></textarea>
      </div>
      <label for="manualToken" class="token-label">Manual Token:</label>
      <input id="manualToken" v-model="manualToken" class="token-field" />
      <button @click="validateToken">Validate Token</button>
      <div v-if="validationResult">
        <p class="validation-result">{{ validationResult }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      generatedToken: null,
      manualToken: '',
      validationResult: null,
    };
  },
  methods: {
    async generateToken() {
      const response = await fetch('http://localhost:3000/generate-token');
      const data = await response.json();
      this.generatedToken = data.token;
    },
    async validateToken() {
      const tokenToValidate = this.manualToken || this.generatedToken;
      const response = await fetch('http://localhost:3000/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToValidate }),
      });
      const data = await response.json();
      this.validationResult = data.message;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  display: flex;
  flex-direction: column;
  max-width: 980px;
  margin: 0 auto;
}

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
}

.token-label {
  margin-top: 20px;
  font-weight: bold;
}

.token-field {
  width: 100%;
  height: 100px;
  margin-top: 10px;
  resize: none;
}

.validation-result {
  margin-top: 10px;
  color: #e74c3c;
  font-weight: bold;
}
</style>

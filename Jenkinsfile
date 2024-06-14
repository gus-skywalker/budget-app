pipeline {
    agent any

    environment {
        NODE_VERSION = '18.19.0'  // Specify your Node.js version
    }

    stages {
        
        stage('Setup') {
            steps {
                // git 'https://github.com/gus-skywalker/budget-app.git'
                script {
                    // Set up Node.js environment
                    def nodeHome = tool name: 'NodeJS', type: 'NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                // Add deployment steps here, e.g., copying files to a server or using a deployment service
                // sh 'scp -r dist/ user@server:/path/to/deploy'
                // or use a specific deployment tool like Firebase, Netlify, or others
                sh 'echo "Deploying the application..."'
            }
        }
    }

    post {
        always {
            cleanWs() // Clean workspace after the build
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}

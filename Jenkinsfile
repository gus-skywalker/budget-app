pipeline {
    agent any

    environment {
        NODE_VERSION = '18.19.0'  // Specify your Node.js version
    }

    stages {
        
        stage('Setup') {
            steps {
                // git 'https://github.com/gus-skywalker/budget-app.git'
                git branch: 'main', credentialsId: '3bafab71-29e5-4d84-93d0-bc33a57123df', url: 'https://github.com/gus-skywalker/budget-app.git'
                node {
                    env.NODEJS_HOME = "${tool 'Node 6.x'}"
                    // on linux / mac
                    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
                    // on windows
                    env.PATH="${env.NODEJS_HOME};${env.PATH}"
                    sh 'npm --version'
                }
                // script {
                //     // Set up Node.js environment
                //     def nodeHome = tool name: 'NodeJS', type: 'NodeJSInstallation'
                //     env.PATH = "${nodeHome}/bin:${env.PATH}"
                // }

            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'cd /home/user/workspaces/budget-app && npm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'cd /home/user/workspaces/budget-app && npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'cd /home/user/workspaces/budget-app && npm run test'
            }
        }

        stage('Build') {
            steps {
                sh 'cd /home/user/workspaces/budget-app && npm run build'
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

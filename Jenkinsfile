pipeline {
  agent any
  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }
  environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerhub-token')
  }
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t programador1sicon/sserp:frontend .'
      }
    }
    stage('Login') {
      steps {
        sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
      }
    }
    stage('Push') {
      steps {
        sh 'docker push programador1sicon/sserp:frontend'
      }
    }
  }
  post {
    always {
      sh 'docker logout'
    }
  }
}
# Lend.fam Frontend Deployment

This directory contains deployment configuration for the lend.fam frontend using the [spot](https://github.com/umputun/spot) deployment tool.

## Quick Start

1. **Install spot:**
```bash
# Install spot deployment tool
curl -s https://raw.githubusercontent.com/umputun/spot/master/install.sh | bash
```

2. **Configure environment:**
```bash
# Copy and edit environment variables
cp env.example.yml env.yml
# Edit env.yml with your actual server details and credentials

# Get your public key
cat ~/.ssh/id_rsa.pub
# Copy the output to SSH_PUBLIC_KEY in env.yml
```

3. **Run deployment:**
```bash
# Step 1: Create deploy user (as root)
spot -t production create-user

# Step 2: Setup server (as deploy user)  
spot -t production-deploy setup-server
spot -t production-deploy configure-security
spot -t production-deploy deploy-app
spot -t production-deploy setup-monitoring

# Step 3: Manual container startup
ssh deploy@your-server "cd /opt/lend-fam && docker compose up -d"
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_HOST` | Target server IP/hostname | `1.2.3.4` |
| `DOMAIN` | Your domain name | `app.lend.fam` |
| `EMAIL` | Email for SSL certificates | `admin@lend.fam` |
| `SSH_KEY_PATH` | SSH private key path | `~/.ssh/id_rsa` |
| `SSH_PUBLIC_KEY` | SSH public key content | `ssh-rsa AAAAB3NzaC1...` |
| `STAGING_HOST` | (Optional) Staging server | `staging.lend.fam` |
| `GRAFANA_CLOUD_PROMETHEUS_URL` | Grafana Cloud Prometheus endpoint | `https://prometheus-prod-01-eu-west-0.grafana.net` |
| `GRAFANA_CLOUD_PROMETHEUS_USERNAME` | Grafana Cloud username | `your-username` |
| `GRAFANA_CLOUD_API_KEY` | Grafana Cloud API key | `your-api-key` |
| `CLUSTER_NAME` | Cluster identifier | `lend-fam` |
| `ENVIRONMENT` | Environment name | `production` |
| `REGION` | Server region | `us-east-1` |

## Deployment Commands

### Install Spot Tool
```bash
# Install spot (one-time setup)
curl -s https://raw.githubusercontent.com/umputun/spot/master/install.sh | bash
```

### Initial Server Setup
```bash
# Source your environment variables first
source .env.local

# Step 1: Create deploy user (as root)
spot -p spot.yml -t production create-user

# Step 2: Run individual setup tasks (as deploy user)
spot -p spot.yml -t production-deploy setup-server
spot -p spot.yml -t production-deploy configure-security
spot -p spot.yml -t production-deploy setup-monitoring
```

### Application Deployment
```bash
# Deploy the application (as deploy user)
spot -p spot.yml -t production-deploy deploy-app

# Setup monitoring (as deploy user)
spot -p spot.yml -t production-deploy setup-monitoring
```

### Updates & Maintenance
```bash
# Update application only (as deploy user)
spot -p spot.yml -t production-deploy deploy-app

# Run specific tasks
spot -p spot.yml -t production-deploy configure-security  # Update security config
spot -p spot.yml -t production-deploy setup-monitoring  # Update monitoring
```

### Staging Deployment
```bash
# Create user and deploy to staging server
spot -p spot.yml -t staging create-user
spot -p spot.yml -t staging-deploy setup-server
spot -p spot.yml -t staging-deploy deploy-app
```

## What Gets Deployed

### Server Configuration
- ✅ Docker & Docker Compose installation
- ✅ UFW firewall configuration
- ✅ Fail2ban intrusion prevention
- ✅ SSH hardening (disable root/password auth)
- ✅ System updates and security patches

### Application Setup
- ✅ Docker container with security hardening
- ✅ Comprehensive monitoring with Grafana Cloud integration

### Security Features
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Rate limiting
- ✅ Container isolation (non-root, read-only)
- ✅ Firewall protection
- ✅ Intrusion detection

## File Structure

```
deploy/
├── spot.yml                    # Main deployment playbook
├── env.example.yml             # Environment variables template  
├── env.yml                     # Your actual environment variables (gitignored)
├── docker-compose.monitoring.yml # Monitoring services stack
└── config/
    ├── docker-daemon.json      # Docker security settings
    ├── jail.local              # Fail2ban configuration
    └── prometheus.yml          # Prometheus configuration

# Uses root project files:
../docker-compose.yml           # Main Docker Compose (copied to server)
../Dockerfile                   # Main Dockerfile
```

## Server Requirements

### Minimum Specifications
- **OS:** Ubuntu 20.04+ / Debian 11+
- **RAM:** 2GB minimum, 4GB recommended
- **Storage:** 20GB minimum, 50GB recommended
- **Network:** Public IP with ports 80/443 accessible

### Prerequisites
- SSH access with public key authentication
- sudo privileges for the deploy user
- Domain name pointing to server IP

## Security Features

### Network Security
- UFW firewall (ports 22, 80, 443)
- Rate limiting (10 req/s with burst of 20)
- Fail2ban protection against brute force
- DDoS mitigation through Nginx

### Container Security
- Non-root user execution
- Read-only filesystem
- No new privileges
- Resource limits
- Health checks

### SSL/TLS
- Let's Encrypt automatic certificates
- HSTS with preload
- Perfect Forward Secrecy
- Strong cipher suites

### Content Security
- Content Security Policy headers
- XSS protection
- Clickjacking protection
- MIME type sniffing prevention

## Monitoring & Maintenance

### Health Checks
- Docker container health checks built-in
- Prometheus monitoring with Grafana Cloud integration
- Node Exporter for system metrics
- cAdvisor for container metrics

### Monitoring Features
- **System Metrics**: CPU, memory, disk, network usage
- **Container Metrics**: Docker container resource usage and health
- **Application Metrics**: Frontend health checks and performance
- **Grafana Cloud**: Metrics automatically sent to your cloud instance
- **Cost Optimized**: Filtered metrics to minimize cloud usage
- **Real-time Dashboards**: Access metrics via Grafana Cloud web interface

### Monitoring Services
- **Prometheus**: Metrics collection and remote write to Grafana Cloud
- **Node Exporter**: System-level metrics (CPU, memory, disk, network)
- **cAdvisor**: Container-level metrics and resource usage
- **Health Checks**: Automatic service health monitoring

### Logs
- Application container logs
- System service logs
- Monitoring service logs

## Troubleshooting

### Check Service Status
```bash
# On server
docker ps
docker logs lend-fam-frontend

# Check monitoring services
docker-compose -f docker-compose.monitoring.yml ps
docker logs lend-fam-prometheus
docker logs lend-fam-node-exporter
docker logs lend-fam-cadvisor
```

### View Logs
```bash
# Application logs
docker logs lend-fam-frontend

# Monitoring logs
docker logs lend-fam-prometheus
docker logs lend-fam-node-exporter
docker logs lend-fam-cadvisor
```

### Access Monitoring
```bash
# Local Prometheus (for debugging)
curl http://localhost:9090/api/v1/query?query=up

# Check if metrics are being collected
curl http://localhost:9100/metrics  # Node Exporter
curl http://localhost:8080/metrics  # cAdvisor
```

### Manual Restart
```bash
cd /opt/lend-fam

# Restart application
docker-compose restart

# Restart monitoring services
docker-compose -f docker-compose.monitoring.yml restart

# Restart specific monitoring service
docker-compose -f docker-compose.monitoring.yml restart prometheus
```


## Advanced Configuration

### Grafana Cloud Setup
1. **Get your Grafana Cloud details:**
   - Login to Grafana Cloud
   - Navigate to "My Account" → "Access Policies" 
   - Create a new access policy with "metrics:write" scope
   - Note your Prometheus endpoint URL and username

2. **Configure environment variables:**
   ```bash
   # Update your .env.local file
   GRAFANA_CLOUD_PROMETHEUS_URL=https://prometheus-prod-01-eu-west-0.grafana.net
   GRAFANA_CLOUD_PROMETHEUS_USERNAME=your-username
   GRAFANA_CLOUD_API_KEY=your-access-policy-token
   ```

3. **Deploy monitoring:**
   ```bash
   spot -p spot.yml -t production-deploy setup-monitoring
   ```

### Custom Environment Variables
Edit `/opt/lend-fam/.env.production` on the server and restart:
```bash
docker-compose restart
```

### Monitoring Configuration
Edit `/opt/lend-fam/.env.monitoring` to customize monitoring:
```bash
# Update monitoring settings
vim /opt/lend-fam/.env.monitoring
docker-compose -f docker-compose.monitoring.yml restart
```


### Scale Resources
Modify `docker-compose.yml` resource limits and restart services.

## Security Best Practices

### Environment Variables & Secrets
- **Never commit sensitive data** to the repository
- Use `env.yml` for actual secrets (gitignored)
- The `env.example.yml` file is a template only
- Spot automatically loads environment variables from `env.yml`

### Files to Keep Private
```bash
# This file contains sensitive data and is excluded from git:
env.yml                       # Your actual environment variables with secrets
```

### Deployment Security
- SSH keys are passed via spot environment variables, not hardcoded
- Grafana Cloud credentials are loaded from env.yml
- Server hostnames are parameterized using spot variables
- All secrets are managed outside the repository in env.yml
- Spot deployment uses native environment variable substitution

## Support

For issues with deployment:
1. Check the deployment logs
2. Verify all environment variables are set
3. Ensure DNS is properly configured
4. Check server firewall and security groups

Common issues and solutions are documented in the troubleshooting section above.
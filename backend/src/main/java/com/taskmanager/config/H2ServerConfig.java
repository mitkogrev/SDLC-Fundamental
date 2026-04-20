package com.taskmanager.config;

import org.h2.tools.Server;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Starts an H2 TCP server so the MCP server (running on port 8090) can connect
 * to the same named in-memory database ("taskdb") that this backend is using.
 *
 * MCP server connection URL:  jdbc:h2:tcp://localhost:9092/mem:taskdb
 *
 * If the port is already in use (e.g. during repeated test runs) the error is
 * caught and logged as a warning so the application context still starts.
 */
@Configuration
@Profile("dev")
public class H2ServerConfig {

    private static final Logger log = LoggerFactory.getLogger(H2ServerConfig.class);

    @Value("${h2.tcp.server.port:9092}")
    private String tcpPort;

    @Bean
    public H2TcpServerHolder h2TcpServer() {
        try {
            Server server = Server.createTcpServer(
                    "-tcp",
                    "-tcpAllowOthers",
                    "-tcpPort", tcpPort,
                    "-ifNotExists"
            );
            server.start();
            log.info("H2 TCP server started on port {} – MCP server can connect via " +
                    "jdbc:h2:tcp://localhost:{}/mem:taskdb", tcpPort, tcpPort);
            return new H2TcpServerHolder(server);
        } catch (Exception e) {
            log.warn("H2 TCP server could not start on port {} (port may already be in use): {}",
                    tcpPort, e.getMessage());
            return new H2TcpServerHolder(null);
        }
    }

    /** Wrapper that safely stops the H2 TCP server on application shutdown. */
    public static class H2TcpServerHolder implements DisposableBean {
        private final Server server;

        H2TcpServerHolder(Server server) {
            this.server = server;
        }

        @Override
        public void destroy() {
            if (server != null && server.isRunning(false)) {
                server.stop();
            }
        }
    }
}

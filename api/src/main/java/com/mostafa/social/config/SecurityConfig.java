package com.mostafa.social.config;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(c -> {
                    CorsConfigurationSource source = corsConfigurationSource();
                    c.configurationSource(source);
                })
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(
                                    "/api/auth/register",
                                    "/api/auth/login").permitAll()
                            // Swagger/OpenAPI endpoints
                            .requestMatchers(
                                    "/swagger-ui/**",
                                    "/swagger-ui.html",
                                    "/api-docs/**",
                                    "/v3/api-docs/**",
                                    "/swagger-resources/**",
                                    "/webjars/**")
                            .permitAll()
                            // logout/me
                            .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                            //  ((Users))  //
                            .requestMatchers(HttpMethod.PUT, "/api/users/{userId}").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/users/{userId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/users").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/users/{userId}").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/users/follow/{followingId}").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/users/unfollow/{followingId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/users/{userId}/followers/count").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/users/{userId}/followings/count").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/users/{userId}/followers").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/users/{userId}/followings").authenticated()
                            //  ((Posts))  //
                            .requestMatchers(HttpMethod.POST, "/api/posts").authenticated()
                            .requestMatchers(HttpMethod.PUT, "/api/posts/{postId}").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/posts/{postId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/posts").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/posts/{postId}").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/posts/{postId}/like").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/posts/user/{userId}").authenticated()
                            //  ((Comments))  //
                            .requestMatchers(HttpMethod.POST, "/api/comments").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/comments/{commentId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/comments/{commentId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/comments/post/{postId}").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/comments/{commentId}/like").authenticated()
                            //  ((Replies))  //
                            .requestMatchers(HttpMethod.POST, "/api/replies").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/replies/{replyId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/replies/comment/{commentId}").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/replies/{replyId}/like").authenticated()
                            //  ((Stories))  //
                            .requestMatchers(HttpMethod.POST, "/api/stories").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/stories").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/stories/{storyId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/stories/{storyId}").authenticated()
                            //  ((Notifications))  //
                            .requestMatchers(HttpMethod.GET, "/api/notifications").authenticated()
                            .requestMatchers(HttpMethod.DELETE, "/api/notifications/{notificationId}").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/notifications/unread-count").authenticated()
                            .requestMatchers(HttpMethod.PUT, "/api/notifications/read/{id}").authenticated()
                            .requestMatchers(HttpMethod.PUT, "/api/notifications/read-all").authenticated()

                            .anyRequest()
                            .authenticated();

                })
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .authenticationManager(authenticationManager(http));

        return http.build();
    }


    @Bean
    AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        var authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());

        return authBuilder.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}
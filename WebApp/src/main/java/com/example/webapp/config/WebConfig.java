package com.example.webapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Collection;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/main.*.js")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
        
        registry.addResourceHandler("/index.html")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache().mustRevalidate());
        
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.DAYS));
    }

    // Add SameSite=Lax to all cookies
    @Bean
    public FilterRegistrationBean<Filter> sameSiteCookieFilter() {
        FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                    throws IOException, ServletException {
                chain.doFilter(request, response);
                HttpServletResponse httpResponse = (HttpServletResponse) response;
                Collection<String> headers = httpResponse.getHeaders("Set-Cookie");
                boolean first = true;
                for (String header : headers) {
                    if (!header.contains("SameSite")) {
                        header = header + "; SameSite=Lax";
                    }
                    if (first) {
                        httpResponse.setHeader("Set-Cookie", header);
                        first = false;
                    } else {
                        httpResponse.addHeader("Set-Cookie", header);
                    }
                }
            }
        });
        bean.addUrlPatterns("/*");
        bean.setOrder(1);
        return bean;
    }
}

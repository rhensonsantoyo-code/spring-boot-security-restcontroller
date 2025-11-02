package habsida.spring.boot_security.demo.dto;

import javax.validation.constraints.*;
import java.util.Set;

public class UserCreateUpdateDto {

    @Email @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'-]*$")
    private String firstName;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'-]*$")
    private String lastName;

    @Min(0) @Max(150)
    private Integer age;

    private String password; // required on create; optional on update

    @NotNull @Size(min = 1)
    private Set<String> roles;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}
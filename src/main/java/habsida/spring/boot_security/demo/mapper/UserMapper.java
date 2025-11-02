package habsida.spring.boot_security.demo.mapper;

import habsida.spring.boot_security.demo.dto.UserDto;
import habsida.spring.boot_security.demo.model.Role;
import habsida.spring.boot_security.demo.model.User;

import java.util.stream.Collectors;

public class UserMapper {
    public static UserDto toDto(User u) {
        return new UserDto(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getAge(),
                u.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
        );
    }
}
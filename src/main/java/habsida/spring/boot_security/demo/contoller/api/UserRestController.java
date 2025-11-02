package habsida.spring.boot_security.demo.controller.api;

import habsida.spring.boot_security.demo.dto.UserCreateUpdateDto;
import habsida.spring.boot_security.demo.dto.UserDto;
import habsida.spring.boot_security.demo.mapper.UserMapper;
import habsida.spring.boot_security.demo.model.Role;
import habsida.spring.boot_security.demo.model.User;
import habsida.spring.boot_security.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserRestController {

    private final UserService users;

    public UserRestController(UserService users) { this.users = users; }

    @GetMapping
    public List<UserDto> list() {
        return users.findAll().stream().map(UserMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public UserDto get(@PathVariable Long id) {
        User u = users.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserMapper.toDto(u);
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserCreateUpdateDto req) {
        if (users.existsByEmailIgnoreCase(req.getEmail())) {
            throw new IllegalArgumentException("This email is already taken");
        }
        User u = new User();
        u.setEmail(req.getEmail().trim());
        u.setFirstName(req.getFirstName().trim());
        u.setLastName(req.getLastName().trim());
        u.setAge(req.getAge());
        u.setPassword(req.getPassword()); // service encodes & requires on create
        u.setRoles(toRoles(req.getRoles()));
        User saved = users.save(u);
        return ResponseEntity.created(URI.create("/api/users/" + saved.getId()))
                .body(UserMapper.toDto(saved));
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody UserCreateUpdateDto req) {
        User existing = users.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        users.findByEmail(req.getEmail().trim()).ifPresent(other -> {
            if (!other.getId().equals(id)) throw new IllegalArgumentException("This email is already taken");
        });

        existing.setEmail(req.getEmail().trim());
        existing.setFirstName(req.getFirstName().trim());
        existing.setLastName(req.getLastName().trim());
        existing.setAge(req.getAge());
        existing.setPassword(req.getPassword()); // blank -> keep (handled in service)
        existing.setRoles(toRoles(req.getRoles()));

        User saved = users.save(existing);
        return UserMapper.toDto(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        users.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Set<Role> toRoles(Set<String> names) {
        return names.stream().map(users::ensureRole).collect(Collectors.toSet());
    }
}
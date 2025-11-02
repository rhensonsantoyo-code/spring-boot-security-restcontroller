package habsida.spring.boot_security.demo.controller.api;

import habsida.spring.boot_security.demo.model.Role;
import habsida.spring.boot_security.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleRestController {

    private final UserService users;

    public RoleRestController(UserService users) { this.users = users; }

    @GetMapping
    public ResponseEntity<List<Role>> all() {
        return ResponseEntity.ok(users.allRoles());
    }
}
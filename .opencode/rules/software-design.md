# Principles and Practices to Design Great Software

## **DRY (Don't Repeat Yourself)**

- Every piece of knowledge should have a single representation.
- Eliminate duplication in logic, data, and structure.
- Abstract common patterns into reusable components.

## **KISS (Keep It Simple, Stupid)**

- Choose the simplest solution that works.
- Avoid unnecessary complexity and cleverness.
- Favor readability over brevity.

## **Domain-Driven Design (DDD)**

- Model software around the business domain.
- Use ubiquitous language shared by developers and domain experts.
- Define bounded contexts with explicit boundaries.
- Separate domain logic from infrastructure concerns.
- Use aggregates to enforce consistency boundaries.

## **Clean Architecture / Hexagonal Architecture**

- Keep business logic independent of frameworks and UI.
- Depend inward: outer layers depend on inner, never reverse.
- Place domain/business rules at the center.
- Isolate external dependencies at the edges.
- Define explicit ports and adapters for external systems.

## **GRASP (General Responsibility Assignment Software Patterns)**

- Assign responsibilities based on information expertise.
- Use high cohesion within classes.
- Maintain low coupling between classes.
- Delegate to controllers for system operations.
- Create objects through dedicated creators.
- Use polymorphism over conditional logic.
- Protect variations with stable interfaces.
- Use pure fabrication for non-domain responsibilities.
- Apply indirection to reduce coupling.

## **Law of Demeter (Principle of Least Knowledge)**

- Talk only to immediate friends.
- Avoid chaining method calls (no `a.getB().getC().doSomething()`).
- Reduce coupling between distant components.

## **Separation of Concerns**

- Divide system into distinct features with minimal overlap.
- Separate business logic from presentation.
- Isolate data access from business rules.
- Keep cross-cutting concerns (logging, security) modular.

## **Composition Over Inheritance**

- Favor object composition over class inheritance.
- Build complex behavior from simple components.
- Avoid deep inheritance hierarchies.
- Use interfaces and delegation for reuse.

## **Convention Over Configuration**

- Provide sensible defaults.
- Reduce boilerplate and configuration burden.
- Make the common case effortless.
- Allow overrides when needed.

## **Principle of Least Astonishment**

- Design APIs that behave as users expect.
- Follow established patterns and idioms.
- Make behavior predictable and consistent.
- Avoid surprising side effects.

## **Test-Driven Development (TDD) Principles**

- Write tests before implementation (Red-Green-Refactor).
- Keep tests fast, isolated, and repeatable.
- Test behavior, not implementation details.
- Maintain high test coverage for critical paths.

## **Continuous Delivery / DevOps Principles**

- Automate everything (builds, tests, deployments).
- Keep main branch always deployable.
- Deploy frequently in small increments.
- Monitor systems continuously.
- Build quality in from the start.
- Practice infrastructure as code.

## **Reactive Manifesto**

- Design responsive systems that react quickly.
- Build resilient systems that stay responsive under failure.
- Create elastic systems that scale under load.
- Use message-driven architecture for loose coupling.

## **CUPID (Alternative to SOLID by Dan North)**

- Composable: plays well with others.
- Unix philosophy: does one thing well.
- Predictable: does what you expect.
- Idiomatic: feels natural.
- Domain-based: uses the language of the problem space.

## **Four Rules of Simple Design (Kent Beck)**

1. Passes all tests
2. Reveals intention
3. No duplication
4. Fewest elements

## **Security Principles**

- Apply defense in depth (multiple layers).
- Validate all inputs, sanitize all outputs.
- Fail securely (fail closed, not open).
- Practice least privilege (minimum necessary permissions).
- Never trust user input.
- Keep security updates current.

## **Performance Principles**

- Measure before optimizing.
- Optimize the bottleneck, not everything.
- Design for performance-critical paths.
- Cache strategically, invalidate correctly.

## **API Design Principles**

- Design APIs that are hard to misuse.
- Make common tasks easy, complex tasks possible.
- Provide consistent naming and behavior.
- Version APIs explicitly.
- Document behavior, not just syntax.

## **Data Principles**

- Normalize to reduce redundancy.
- Denormalize strategically for performance.
- Maintain data integrity through constraints.
- Plan for eventual consistency in distributed systems.
- Separate reads from writes when appropriate (CQRS).

**Meta-Principle:** Know when to break any rule. All principles are contextual tools, not absolute laws. Choose principles appropriate for your specific context, team, and constraints.

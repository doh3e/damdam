package com.ssafy.damdam.domain.counsels.entity;

import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "counseling")
public class Counseling extends BaseTimeEntityWithUpdatedAt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "couns_id")
    private Long counsId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

}
